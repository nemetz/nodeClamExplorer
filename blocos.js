//coletar blocos e armazenar os dados e as transacoes

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


var bloco=0;
var fila=0;
function armazena(){
	db.query("SELECT valor FROM config WHERE config='txIndexado'", function (err, resultado, fields) {
		
		//resume do ultimo bloco indexado
		bloco=(resultado[0]['valor']/1)+1;

		//bloco=99999999999;
		
		//dados do bloco
		child = exec('clam getblockbynumber '+bloco,
			{maxBuffer: 1024*1024*1},function (erro, data, stderr) {

				if(!data){
					console.log('sincronizado, aguardando 10 segundos...');
					bloco=bloco-1;
					setTimeout(function(){
						armazena();
					}, 10000)
					return false;
				}

				var dados=JSON.parse(data);

			

				var sql="INSERT INTO blocos (id,hash,timestamp,tamanho)"+
						"VALUES('"+dados['height']+"','"+dados['hash']+"','"+dados['time']+"','"+dados['size']+"')";



				db.query(sql, function (err, resultado, fields) {


					
					var transacoes=JSON.parse(data)['tx'];

					
					var terminado=0;

					fila=transacoes.length;

					for(var i in transacoes){

						var sql="INSERT INTO transacoes (id,bloco)"+
						"VALUES('"+transacoes[i]+"','"+bloco+"')";

						db.query(sql, function (err, resultado, fields) {

							fila--;
							if(fila==0){
								console.log(bloco+' indexado');
								//bloco++;

								db.query("UPDATE config SET valor='"+bloco+"' WHERE config='txIndexado'", function (err, resultado, fields) {
									setTimeout(function(){
										//if(bloco<max){
											armazena();		
										//}									
									}, 500)
									
								})
							}
						})					
						
					}

				})
				
		})


	});
}


function verifica(){
	//console.log()
}

/*
//definir o maximo de blocos pra saber quando parar
var max=0;
child = exec('clam getinfo ',{maxBuffer: 1024*1024*1},function (erro, data, stderr) {
	max=JSON.parse(data)['blocks']/1;
	armazena();
})*/

armazena();




//clam gettransaction db81867c3a117f430705fb48d8efa6bb5aaa3c3bb3748b0217a465e37184d9e6 | grep speech
