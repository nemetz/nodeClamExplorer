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
		db.query("select TABLE_ROWS as total from INFORMATION_SCHEMA.TABLES where TABLE_NAME='transacoes'", function (err, total, fields) {	

			db.query("select * from transacoes where bloco>'"+(dados['bloco'].replace(/\D/g,'')/1)+"' ORDER BY bloco DESC LIMIT 10", function (err, ultimos, fields) {
				
				if(typeof(ultimos[0])!='object'){
					ultimos=new Array();
					ultimos[0]=new Object();
				}

				//if(ultimos[0]){
					ultimos[0]['total']=total[0]['total'];	
				//}

				for(var i in ultimos){
					if(ultimos[i]['id']){
						ultimos[i]['altId']=ultimos[i]['id'].slice(6);
						ultimos[i]['id']=ultimos[i]['id'].slice(0,6);	
					}
					
				}
				
				child = exec('clam getrawmempool',{maxBuffer: 1024*1024*10},function (erro, mempool, stderr) {
						mempool=JSON.parse(mempool);
						
						//if(typeof(ultimos[0])!='undefined'){
							ultimos[0]['mempool']=mempool;	
						//}

						/*console.log(ultimos);

						console.log(JSON.stringify(ultimos));*/
						

						cliente.write(JSON.stringify(ultimos));
						cliente.end();
						return false;

						
					})


				
			})
		})
	}
}


