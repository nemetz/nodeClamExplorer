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
		
		if(typeof(dados)=='string'){
			dados=new Array();
		}

		
		if(typeof(dados['page'])=='undefined'){
			dados['page']='1';
		}


		var pagina=dados['page'].replace(/\D/g,'')/1;
		
		
		//coletar pedacos do template
		template=template.split('{pedaco}');

		db.query("select MAX(bloco) as total from transacoes", function (err, total, fields) {
			
			var total=total[0]['total'];
			var paginas=total/1;
			
			//var paginas=785;

			//paginacao
			var htmlPaginacao='';
			var paginaAtual=dados['page']/1;
			for(var i=paginaAtual-5;i<=paginaAtual+5;i++){
				if(i>=1 && i<=paginas){
					var active='';
					if(i==dados['page']){
						active='active';
					}
					htmlPaginacao=htmlPaginacao+template[2]
					.replace(/{active}/g, active)
					.replace(/{page}/g, i);
						
				}
				
				
			}
			
			template[0]=template[0].replace(/{paginacao}/g, htmlPaginacao);
			
			template[0]=template[0].replace(/{lastPage}/g, paginas);
			
			template[0]=template[0].replace(/{bloco}/g, pagina);


			//db.query("select * from transacoes limit "+pagina+",10", function (err, speech, fields) {

			db.query("select * from transacoes where bloco="+pagina, function (err, speech, fields) {

				
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

