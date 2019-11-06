var md5=require('MD5');

module.exports = {
	exibir: function (requisicao, cliente, dados, database){
		usuario=dados.usuario;
		senha=dados.senha;
		
		
		
		database.query('SELECT * FROM usuarios WHERE usuario="'+usuario+'" AND senha="'+senha+'"', function(err, rows, fields) {
			if(err){
				console.log("Erro no login: ");
				console.log(err);
				return false;
			}
			if(rows[0] && rows[0].senha==senha){
				//hash de autenticacao composto de senha + numero do dia da semana, iniciando 
				//em 0 no domingo
				var auth=md5(senha+new Date().getDay());
				
				
				/*
				cliente.writeHead(200, {
					'Set-Cookie': '{"usuario":"'+usuario+'","auth":"'+auth+'"}'
				});*/
				
				cliente.writeHead(200, {
					'Set-Cookie': ["auth="+auth, "usuario="+usuario]					
				});
				
				
				
				cliente.write(JSON.stringify({"logado":"1"}));
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
				
				var ip = requisicao.headers['x-forwarded-for'] || requisicao.connection.remoteAddress;
				
				database.query("INSERT INTO logins(usuario,data,ip) VALUES('"+usuario+"','"+hashData
				+"', '"+ip+"')");
			}
			else{
				cliente.write(JSON.stringify({"logado":"0"}));
			}
			cliente.end();
		});
	}
};
