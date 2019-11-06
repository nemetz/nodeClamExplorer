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

		db.query("select * from transacoes where match(speech) against ('+create +clamour' in boolean mode)", function (err, clamour, fields) {

			//remover os que nao tem link
			
			for(var i = clamour.length - 1; i >= 0; i--) {
				if(clamour[i]['speech'].indexOf('http')<0) {
					clamour.splice(i, 1);
				}
			}

			
			
			
			var total=clamour.length;
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


			db.query("select speech from transacoes where bloco>(select max(bloco)-10000 from transacoes) AND speech like 'clamour %' /*and coinbase*/", function (err, votos, fields) {
				

					
					//popular votos
					for(var i in clamour){
						var codigo=clamour[i]['speech'].split(' ')[2].slice(0,8);
						clamour[i]['votos']=0;
						
						for(var ii in votos){					
							if(codigo.length==8 && votos[ii]['speech'].indexOf(codigo)>0){
								clamour[i]['votos']+=1;							
							}
						}					
					}

					//ordenar por votos
					clamour.sort((a, b) => (b['votos'] - a['votos']))
					
					var paginaAtual=dados['page']*10;
					var paginaMax=paginaAtual+10;
					var htmlUltimos='';

					for(paginaAtual;paginaAtual<paginaMax;paginaAtual++){
						
						if(typeof(clamour[paginaAtual])!='undefined'){
							var peticao=clamour[paginaAtual];
							var pedacosSpeech=peticao['speech'].split(' ');
							
							var linkClamour='#';
							if(peticao['speech'].indexOf('http')>0){
								linkClamour='http'+peticao['speech'].split('http')[1].split(' ')[0];
							}
							
							htmlUltimos=htmlUltimos+template[1]
							.replace(/{bloco}/g, peticao['bloco'])
							//.replace(/{percent}/g, ((peticao['votos']/votos.length)*100).toFixed(2))
							.replace(/{percent}/g, ((peticao['votos']/10000)*100).toFixed(2))
							
							.replace(/{id}/g, peticao['id'].slice(0, 6))
							.replace(/{altId}/g, peticao['id'].slice(6))
							.replace(/{altCodigo}/g, pedacosSpeech[2].slice(8))
							.replace(/{codigo}/g, pedacosSpeech[2].slice(0,8))
							.replace(/{link}/g, linkClamour)
							.replace(/{votos}/g, peticao['votos'])
							.replace(/{speech}/g, peticao['speech']);
						}
						

						
					}

					template[0]=template[0].replace(/{list}/g, htmlUltimos);
					



					/*var pedacosSpeech=speech[i]['speech'].split(' ');
						
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
						.replace(/{speech}/g, speech[i]['speech']);*/

					//template[0]=template[0].replace(/{list}/g, htmlUltimos);






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

