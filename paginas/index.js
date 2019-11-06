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
		
		
		
		//coletar pedacos do template
		template=template.split('{pedaco}');



		db.query("select TABLE_ROWS as total from INFORMATION_SCHEMA.TABLES where TABLE_NAME='transacoes'", function (err, total, fields) {
			
			var total=total[0]['total'];
			var paginas=Math.floor(total/10);

			/*//paginacao
			var htmlPaginacao='';
			for(var i=0;i<=paginas;i++){
				htmlPaginacao=htmlPaginacao+template[2]
				.replace(/{query}/g, dados['query'])
				.replace(/{page}/g, i)
				.replace(/{pageplus}/g, i+1);
				
				
			}
			template[0]=template[0].replace(/{paginacao}/g, htmlPaginacao);	*/


			//se der problema a query de baixo
			//db.query("select any_value(id) as id,max(bloco) as bloco,speech,any_value(coletado) as coletado from (select * from transacoes where speech!='' order by bloco DESC limit 100) as temp GROUP BY speech order by bloco DESC limit 10", function (err, latest, fields) {

			db.query("select id,max(bloco) as bloco,speech,coletado from (select * from transacoes where speech!='' order by bloco DESC limit 100) as temp GROUP BY speech order by bloco DESC limit 10", function (err, latest, fields) {



					var htmlUltimos='';

					for(var i in latest){
						htmlUltimos=htmlUltimos+template[1]
						.replace(/{bloco}/g, latest[i]['bloco'])
						.replace(/{id}/g, latest[i]['id'].slice(0, 6))
						.replace(/{altId}/g, latest[i]['id'].slice(6))
						.replace(/{speech}/g, latest[i]['speech']);
						
						
					}

					template[0]=template[0].replace(/{latest}/g, htmlUltimos);


					template[0]=template[0].replace(/{totalSpeech}/g, total);
					
					if(!latest){
						template[0]=template[0].replace(/{latestBlock}/g, 'none');
					}
					else if(!latest[0]){
						template[0]=template[0].replace(/{latestBlock}/g, 'none');
					}
					else{
						template[0]=template[0].replace(/{latestBlock}/g, latest[0]['bloco']);
					}
					

				
					//template[0]=template[0].replace(/{}/g, JSON.stringify(sortable));
				
					cliente.write(template[0]);
					cliente.end();
				

			})

		})
		




		}
	}

