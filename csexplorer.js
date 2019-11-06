var fs=require('fs');
var exec = require('child_process').exec;
var path = require('path');
var qs = require('querystring');
var http = require('http');
var mime = require('mime-types');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

//atualizar valores







var http = require('http'),
    inspect = require('util').inspect;

var Busboy = require('busboy');

/*
var database = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database:'clam',
  connectionLimit : 800
});*/

//database.connect();

//montar database
var database=new Array();


if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('Fork morto, reanimando');
		cluster.fork();
	});
} else {
	http.createServer(function(requisicao, cliente) {

		verificarLogin(requisicao.headers.cookie, function(login){

			//poupando uma variavel de parametro
			requisicao.login=login;

			var ip = requisicao.headers['x-forwarded-for'] || requisicao.connection.remoteAddress;
			ip=ip.split(',')[0];
			
			var ipRegex=/^[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}$/;
			
			
			
		
			
			//rotear pedido
			try{
				var url=decodeURIComponent(requisicao.url);
				url=url.replace(/'/g, '').replace(/"/g, '').replace(/;/g, '')
				.replace(/</g, '').replace(/>/g, '').replace(/#/g, '');
			}
			catch(e){
				console.log('Erro de roteamento, provavel injeção: ');
				console.log(requisicao.url);
				
				console.log('ip '+ip);
				return false;
			}


			var extensoes=new Array('.jpg','.png','.bmp','.gif','.svg','.css','.js','.avi','.mpg','.mp4','.ico','.swf','.txt','.xml','.svg','.html','.woff2','.woff','.ttf','.otf','.eot','.mp3');

			var estatico=false;
			for(var i in extensoes){
				if(url.split('?')[0].indexOf(extensoes[i])!=-1){
					estatico=true;
				}
			}

			

			if(estatico){
				//arquivo
				fs.readFile('./arquivos'+url.split('?')[0], function(erro, arquivo){
					if(arquivo){
						cliente.write(arquivo);
			
						var tipo=mime.lookup('./arquivos'+url);
						cliente.end();
					}
					else{
						//fs.readFile('./templates/404.html', function(err,template404){
							cliente.writeHead('404');
							cliente.write('404');
							cliente.end();
						//})
					}
				})
			}else{
				//pagina

				//logando hit
				console.log(ip+' - '+requisicao.url);

				//parametros GET
				var parametros=url.split('?')[1];

				if(parametros){
					var parametrosTemp=new Array();
					var token=parametros.split('&');
					for(var i in token){
						var token2=token[i].split('=');
						parametrosTemp[token2[0]]=decodeURIComponent(token2[1]);
					}
					parametros=parametrosTemp;
				}

				url=url.split('?')[0];

				//se for /, chamando inicio
				if(url.split('/')[1]==''){
					url=url+'index';
				}

					//checar se existe pasta com esse nome
					fs.exists('./paginas'+url, function(existe){
						if(existe){
							//eh uma pasta, adicionar inicio
							url=url+'/index';
						}

						//checar se a pagina existe
						fs.exists('./paginas'+url+'.js', function(existe){
							if(!existe){
								
								//nao existe, tentar buscar qualquer coisa no futuro. 
								//ex. /transacao
								fs.readFile('./templates/404.html', function(err,template404){
									cliente.writeHead('404');
									//cliente.write(template404.toString());
									cliente.write('404');
									cliente.end();
								})
							}
							else{
								redirecionar(url, requisicao, cliente, parametros);
							}
						})
					})
				
			}
		})
		
		
	
		
}).listen(82, "0.0.0.0");
}

console.log('Nova instância rodando na porta 82');

//parametro extra nao eh obrigatorio
function redirecionar(url,requisicao, cliente, extra){
	//adicionar script
	var pagina=require('./paginas'+url+'.js');
	fs.readFile('./templates'+url+'.html', function(erro,template){
		fs.readFile('./templates/cabecalho.html', function(erro,cabecalho){
			
			
			if(typeof(template)!='undefined'){
				template=template.toString();
			}
			else{
				template='';
			}


			//preencher cabecalho
			//template=template.replace(/{cabecalho}/g, cabecalho.toString());

			//checar GET/POST
			if(typeof(requisicao.headers['content-type'])=='undefined'){
				//GET
				dados='';
				if(extra){
					dados=extra;
				}
				pagina.exibir(requisicao, cliente, dados, database, template);
			}
			else{
				
				try{
					var busboy = new Busboy({ headers: requisicao.headers });
				}
				catch(e){
					cliente.end();
					return false;
				}

				var dados=new Object();

				/*busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
					
					//definir extensao
					var extensao=false;
					if(mimetype=='image/jpeg'){extensao='.jpg'}
					if(mimetype=='image/gif'){extensao='.gif'}
					if(mimetype=='image/png'){extensao='.png'}
					
					if(extensao){
						var saveTo = './temp/'+fieldname+extensao;
						file.pipe(fs.createWriteStream(saveTo));

						file.on('end', function() {
							dados[fieldname]='./temp/'+fieldname+extensao;
						});
					}
					
					
				});*/
				busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated){
					dados[fieldname]=val;					
				});
				busboy.on('finish', function() {
					pagina.exibir(requisicao, cliente, dados, database, template);
				});
				requisicao.pipe(busboy);
			}
		})
	})
}

function verificarLogin(cookie,callback){

	if(cookie && cookie.indexOf('usuario')!=-1 && cookie.indexOf('auth')!=-1){
		var md5=require('MD5');
		var cookieTemp;
		cookies=cookie.split(';');

		var cookie=new Array();
		for(var i in cookies){
			cookies[i]=cookies[i].split('=');
			cookie[cookies[i][0].trim()]=cookies[i][1];
		}




		if(cookie){
			if(cookie.usuario && cookie.auth){
				cookieTemp=cookie;
				
				cookie.usuario=cookie.usuario.replace(/\//g, '').replace(/[%]/g, ' ').replace(/'/g, '')
					.replace(/"/g, '').replace(/</g, '').replace(/>/g, '').replace(/[!]/g, '')
					.replace(/[*]/g, '').trim();
				
				database.query('SELECT senha,usos,cpf,validadeCreditos,tipo FROM usuarios WHERE usuario="'+cookie.usuario+'"', function(err, rows, fields) {
					var senha='';
					//console.log('SELECT senha,usos,cpf,validadeCreditos,tipo FROM usuarios WHERE usuario="'+cookie.usuario+'"');
					if(typeof(rows)!='undefined'){
						if(typeof(rows[0])!='undefined'){
							senha=rows[0]['senha'];
						}
					}
					else{
						try{
							database.query('UPDATE ips SET ofensas=999 WHERE ip="'+ip+'"');
							console.log('IP banido por tentativa de mudança de cookies, '+ip);
						
							cliente.write(lixo());
							cliente.end();
						}catch(e){
							console.log("*REQUISICAO OFENSIVA*")
							console.log(requisicao);
						}
						return false;
					}
						

					var auth=md5(senha+new Date().getDay());
					login=false;
					if(cookieTemp.auth==auth){
						login=cookieTemp;
						login.usos=rows[0]['usos'];
						login.tipo=rows[0]['tipo'];
						login.cpf=rows[0]['cpf'];
						login.administrador=rows[0]['tipo'];

						//validade dos creditos
						var dia=new Date().getDate();
						var mes=new Date().getMonth()+1;
						var ano=new Date().getFullYear();
						var hora=new Date().getHours();
						var minuto=new Date().getMinutes();

						var mascara='00';
						mes=mascara.slice(0, String(mes.toString()).length*-1)+mes.toString();
						dia=mascara.slice(0, String(dia.toString()).length*-1)+dia.toString();
						hora=mascara.slice(0, String(hora.toString()).length*-1)+hora.toString();
						minuto=mascara.slice(0, String(minuto.toString()).length*-1)+minuto.toString();
						var hashData=ano+mes+dia+hora+minuto;



						if(hashData<=rows[0].validadeCreditos || !rows[0].validadeCreditos){
							login.validade=1;
						}
						else{
							//expirado
							login.validade=0;
						}



						//ultimos termos buscados
						database.query('SELECT termo,tipo FROM historico WHERE usuario="'+cookieTemp.usuario+'" ORDER BY data DESC LIMIT 4', function(err, rows, fields) {
							login.historico=rows;
							callback(login);
						})
					}
					else{
						callback(login);
					}

				})
			}

		}

	}
	else{
		callback(false);
	}
}


