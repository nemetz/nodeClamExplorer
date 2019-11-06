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
			dados['page']=0;
		}


		var pagina=dados['page']*10;
		
		//coletar pedacos do template
		template=template.split('{pedaco}');

		db.query("SELECT count(*) as total from(SELECT t.id FROM speech INNER JOIN(select speech,any_value(id) as id,max(bloco) as bloco,CONCAT(CONCAT('%',SUBSTRING(speech, 15,9)),'%') as codigo from speech where speech like 'create clamour %' group by speech) as t ON speech.speech LIKE CONCAT('%',t.codigo) group by t.speech) as temp", function (err, total, fields) {
			
			
			var total=total[0]['total']/1;
			var paginas=Math.floor(total/10);
			
			//var paginas=785;

			//paginacao
			var htmlPaginacao='';
			var paginaAtual=dados['page']/1;
			for(var i=paginaAtual-5;i<=paginaAtual+5;i++){
				if(i>=0 && i<=paginas){
					var active='';
					if(i==dados['page']){
						active='active';
					}
					htmlPaginacao=htmlPaginacao+template[2]
					.replace(/{active}/g, active)
					.replace(/{page}/g, i)
					.replace(/{pageplus}/g, i+1);
						
				}
				
				
			}
			
			template[0]=template[0].replace(/{paginacao}/g, htmlPaginacao);
			
			template[0]=template[0].replace(/{lastPage}/g, paginas);


			db.query("SELECT t.speech,t.id,t.bloco,count(*) as votos FROM speech INNER JOIN(select speech,any_value(id) as id,max(bloco) as bloco,CONCAT(CONCAT('%',SUBSTRING(speech, 16,8)),'%') as codigo from speech where speech like 'create clamour %' group by speech) as t ON speech.speech LIKE CONCAT('clamour ',t.codigo) group by t.speech order by votos DESC limit "+pagina+",10", function (err, speech, fields) {

				var htmlUltimos='';

				for(var i in speech){
					var pedacosSpeech=speech[i]['speech'].split(' ');
					
					var linkClamour='#';
					if(speech[i]['speech'].indexOf('http')){
						linkClamour='http'+speech[i]['speech'].split('http')[1];
					}
					
					htmlUltimos=htmlUltimos+template[1]
					.replace(/{bloco}/g, speech[i]['bloco'])
					.replace(/{id}/g, speech[i]['id'].slice(0, 6))
					.replace(/{altId}/g, speech[i]['id'].slice(6))
					.replace(/{altCodigo}/g, pedacosSpeech[2].slice(8))
					.replace(/{codigo}/g, pedacosSpeech[2].slice(0,8))
					.replace(/{link}/g, linkClamour)
					.replace(/{votos}/g, speech[i]['votos'])
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

