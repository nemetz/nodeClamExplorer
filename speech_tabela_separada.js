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
	db.query("select id from transacoes "+
			" left join clamspeech on clamspeech.tx=transacoes.id "+
			" where speech is null limit 1", function (err, tx, fields) {
			console.log('coletando '+tx[0]['id']);
		if(tx.length){


			child = exec('clam gettransaction '+tx[0]['id'],
			{maxBuffer: 1024*1024*1},function (erro, data, stderr) {
				data=JSON.parse(data);
				if(typeof data['clam-speech'] === 'undefined'){
					speech='';
				}
				else{
					speech=data['clam-speech'];
				}

				db.query("INSERT INTO clamspeech(tx,speech)  "+
				" VALUES('"+data['txid']+"','"+speech+"') ", 
				function (err, tx, fields) {
					/*setTimeout(function(){
						console.log('coletado: '+speech);
						busca();
					},100)*/
					console.log('coletado: '+speech);
					busca();
				})
				
			})
		}
		else{
			console.log('sincronizado, aguardando 30 segundos...');
			setTimeout(function(){
				busca();
			},30000)
		}
		
	})
}


busca();