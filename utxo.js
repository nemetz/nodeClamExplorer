//preenche a db de clamspeech

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



function busca(){
	db.query("select id from transacoes where coletado=1 limit 10", function (err, tx, fields) {
			
		if(tx.length){
			console.log('coletando '+tx[0]['id']);

			tx[0]['id']='ee2d38682a437c386ad6e51bd7831283afc2aaed4d8fffebb940b6128a2840cc';

			child = exec('clam gettransaction '+tx[0]['id'],
			{maxBuffer: 1024*1024*10},function (erro, data, stderr) {
				try{
					data=JSON.parse(data);	
				}
				catch(e){
					console.log("Falha");
					db.query("DELETE FROM transacoes WHERE id='"+tx[0]['id']+"'", 
				function (err, tx, fields) {})
					busca();
					return false;
				}
				
				var recebido=data['vin'];
				var gasto=data['vout'];

				//console.log(recebido);

				
				for(var i in recebido){
					console.log(recebido[i]);	
				}
				
				console.log('\n-----\n');
				

				for(var i in gasto){
					console.log(gasto[i]);	
				}

				/*busca();	
				return false;*/

				process.exit();

				var coinbase=0;
				if(typeof(recebido[0]['coinbase'])!='undefined'){
					coinbase=1;
				}

				

				if(typeof data['clam-speech'] === 'undefined'){
					speech='';
				}
				else{
					/*speech=data['clam-speech']
					.replace(/\uFFFD/g, '')
					.replace(/'/g, "\\'")
					.replace(/\\+/g, "\\\\")
					.replace(/\\\\/g, '');*/
					//escapa caracteres pra DB, ja inclui aspas simples
					speech=db.escape(data['clam-speech']);
				}

				if(speech==''){
					speech="''";
				}


				db.query("UPDATE transacoes SET speech="+speech+",coletado=1,coinbase="+coinbase+" WHERE id='"+data['txid']+"' ", 
				function (err, tx, fields) {
					if(err){
						console.log(err);
						console.log("UPDATE transacoes SET speech='"+speech+"',coletado=1 WHERE id='"+data['txid']+"' ");
						process.exit();
					}
					/*setTimeout(function(){
						console.log('coletado: '+speech);
						busca();
					},100)*/

					

					if(coinbase){
						console.log('coinbase coletado');
					}
					else{
						console.log('coletado');	
					}
					
					busca();	

					/*if(typeof data['clam-speech'] != 'undefined' && data && data['clam-speech']!='' && data['clam-speech'].slice(0,11)!='Expression ' && data['clam-speech'].slice(0,16)!='text:Expression ' && data['clam-speech'].slice(-21)!='-Andreas Antonopolous' && data['clam-speech'].slice(-17)!='-Satoshi Nakamoto'){
						db.query("INSERT IGNORE INTO speech SELECT * FROM transacoes WHERE id='"+data['txid']+"'", 
						function (err, tx, fields) {
							console.log('novo speech: '+speech);
							busca();
						})
	
					}
					else{
						console.log('coletado');
						busca();	
					}*/

					
				})
				
			})
		}
		else{
			console.log('sincronizado com a rede, aguardando 10 seg...');

			/*db.query("insert ignore into speech select any_value(id),bloco,speech,any_value(coletado) from transacoes where speech!='' and speech not like 'expression %' and speech not like 'text:Expression %' and speech not like '% -Satoshi Nakamoto' and speech not like '% -Andreas Antonopolous' GROUP BY bloco,speech order by bloco DESC limit 10000", 
				function (err, tx, fields) {
					busca();					
			})*/

			setTimeout(function(){
				busca();						
			}, 10000)
			
			/*db.query("insert ignore into speech select any_value(id),bloco,speech,any_value(coletado) from(select * from transacoes order by bloco desc limit 10000) as temp  where speech!='' and speech not like 'expression %' and speech not like 'text:Expression %' and speech not like '% -Satoshi Nakamoto' and speech not like '% -Andreas Antonopolous' GROUP BY bloco,speech", 
				function (err, tx, fields) {
					setTimeout(function(){
						busca();						
					}, 10000)
					
			})*/

			
		}
		
	})
}


busca();