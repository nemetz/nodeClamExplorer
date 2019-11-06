var exec = require('child_process').exec;
var mysql = require('mysql');

var db = mysql.createConnection({
  host: "localhost",
  user: "nemetz",
  password: "mwave32",
  database: "clam"
});

db.connect(function(err) {
  if (err) throw err;
 
});

module.exports = {
	exibir: function (requisicao, cliente, dados, database, template) {
		
		var query=dados['query']
		.replace(/'/g, '\'')
		.replace(/[+]/g, ' ')
		.replace(/[-]/g, '')
		.split(' ');

		
		var match='';
		for(var i in query){
			match=match+"+"+query[i]+" ";
		}

		if(typeof(dados['page'])=='undefined'){
			dados['page']=0;
		}

		var pagina=dados['page']*100;
		
		//coletar pedacos do template
		template=template.split('{pedaco}');

		

		db.query("select count(*) as total from transacoes where MATCH(speech) AGAINST('"+match+"' IN BOOLEAN MODE)", function (err, total, fields) {

			
			var total=total[0]['total'];
			var paginas=Math.floor(total/100);

			//paginacao
			var htmlPaginacao='';
			for(var i=0;i<=paginas;i++){
				htmlPaginacao=htmlPaginacao+template[2]
				.replace(/{query}/g, dados['query'])
				.replace(/{page}/g, i)
				.replace(/{pageplus}/g, i+1);
				
				
			}
			template[0]=template[0].replace(/{paginacao}/g, htmlPaginacao);


			db.query("select * from transacoes where MATCH(speech) AGAINST('"+match+"' IN BOOLEAN MODE) limit "+pagina+",100", function (err, speech, fields) {
			
				var htmlUltimos='';

				for(var i in speech){
					htmlUltimos=htmlUltimos+template[1]
					.replace(/{bloco}/g, speech[i]['bloco'])
					.replace(/{id}/g, speech[i]['id'].slice(0, 6))
					.replace(/{altId}/g, speech[i]['id'].slice(6))
					.replace(/{speech}/g, speech[i]['speech']);
					
					
				}

				template[0]=template[0].replace(/{list}/g, htmlUltimos);






				if(total>0){
					if(total>=100){
					template[0]=template[0].replace(/{totalSpeech}/g, total+" clamspeech found");
					}
					else{
						template[0]=template[0].replace(/{totalSpeech}/g, total+" clamspeech found");
					}
				}
				else{
					template[0]=template[0].replace(/{totalSpeech}/g, "no results");
				}

				
				
				
				
			
				//template[0]=template[0].replace(/{}/g, JSON.stringify(sortable));
			
				cliente.write(template[0]);
				cliente.end();
			
			})

		})


		




		}
	}

