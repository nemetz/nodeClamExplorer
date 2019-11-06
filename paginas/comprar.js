var exec = require('child_process').exec;
var fs = require('fs');
var btc,clam,eth,dash,ltc,doge,maid,nxt,xmr,bch,lsk,comprado;

var ips=new Object();

//rodando a cada 12 horas
setTimeout(function(){
	//ips=new Object();
}, 43200000)

module.exports = {
	exibir: function (requisicao, cliente, dados, database, template) {


		var ip = requisicao.headers['x-forwarded-for'] || requisicao.connection.remoteAddress;
		ip=ip.split(',')[0];


		/*if(!ips[ip]){
			ips[ip]=1;	
		}
		else{
			ips[ip]++;	
		}

		if(ips[ip]>5){
			cliente.write('Você ultrapassou o limite de 5 boletos gerados por dia. Por favor, tente novamente amanhã ou entre em contato conosco no e-mail suporte@criptocambio.com.br');
			cliente.end();
			console.log('Atingiu o limite: '+ip);
			return false;
		}*/
		

		
		if(typeof(dados.valor)=='undefined' || typeof(dados.moeda)=='undefined' || typeof(dados.carteira)=='undefined' || dados.carteira.trim()=='' || dados.valor.trim()==''){
			cliente.write('Erro: Preencha todos os campos');
			cliente.end();
			return false;
		}
		
		//dados.valor=(dados.valor/1).toFixed(2);
		dados.valor=dados.valor.replace(',', '.');
		
		dados.carteira=dados.carteira.trim();

		
		if(!/[a-km-zA-HJ-NP-Z0-9]{34,}/.test(dados.carteira)){
			cliente.write('Erro: A carteira informada está incorreta, verifique<br>');
			cliente.end();
			return false;
		}
		
		
		//verificar carteira
		child = exec('curl -k "https://shapeshift.io/validateAddress/'+dados.carteira+'/'+dados.moeda+'"',
		{maxBuffer: 1024*1024*1},function (erro, validado, stderr) {
			
			try{
				validado=JSON.parse(validado);
			}catch(e){
				cliente.end();
				return false;				
			}
			
			
			if(!validado.isvalid){
				cliente.write('Erro: A carteira informada está incorreta<br>');
				cliente.end();
				return false;
			}

			fs.readFile('arquivos/ticker', 'utf8', function (err,data) {

				
				var moedas=JSON.parse(data);


				/*console.log(dados);
				console.log(moedas[dados.moeda]);*/

				dados.valor=dados.valor/1;

				
				comprado=(dados.valor/moedas[dados.moeda]).toFixed(6);

				
				if(dados.valor<50){
						cliente.write('Erro: Valor de compra muito baixo: O mínimo é R$50,00.<br>');
						cliente.end();
						return false;							
				}

				if(dados.valor>5000){
						cliente.write('Erro: Valor de compra muito alto: O máximo é R$5000,00.');
						cliente.end();
						return false;							
				}

				if(dados.identificacao=='undefined'){
					dados.identificacao='';
				}

				//data de vencimento do boleto, D+1
				var date = new Date();
				// add a day
				date.setDate(date.getDate() + 1);

				date=date.toISOString().split('T')[0];

				dados.cpf=dados.cpf.replace(/\D/g,'');

				//console.log(dados.cpf);

				var codigoCompra=dados.moeda+"<>"+dados.carteira+"<>"+comprado;

				/*codigoCompra = Buffer.from(codigoCompra).toString('base64');

				console.log(codigoCompra);
				return false;*/

				//desencodar: 
				//Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('utf8');
				
						
						/*child = exec('curl --header "Content-Type: application/json" --request POST --data \'{"reference": "'+codigoCompra+'","notificationURL":"http://criptocambio.com.br/notificacao","firstDueDate": "'+date+'","numberOfPayments": "1","periodicity": "monthly","amount": "'+dados.valor+'","instructions": "Não receber após o vencimento","description": "Envio de '+dados.moeda+' '+comprado+' para a carteira '+dados.carteira+'","customer": {"document": {"type": "CPF","value": "'+dados.cpf+'"},"name": "'+dados.nome+'","email":"'+dados.email+'","phone": {"areaCode": "'+dados.ddd+'","number": "'+dados.fone+'"}}}\' "https://ws.pagseguro.uol.com.br/recurring-payment/boletos?email=nemetz@email.com&token=387B4D4F8EE74AB7A08845DB3ED0910B"',
						{maxBuffer: 1024*1024*1},function (erro, html, stderr) {*/


						var data=new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');


						fs.appendFile('arquivos/comprasEfetuadas.txt', 
							ip+'<>'+
							data+'<>'+
							dados.valor+"<>"+
							dados.nome+"<>"+
							dados.cpf+"<>"+
							dados.moeda+"<>"+ 
							comprado+"<>"+ 
							dados.carteira+"\n", 
							function (err) {

							
							
						
							cliente.write('https://criptocambio.com.br/instrucoesPagamento?nome='+dados.nome+'&valor='+dados.valor+"&cpf="+dados.cpf+"&carteira="+dados.carteira+"&quantidade="+comprado+"&moeda="+dados.moeda);
							cliente.end();
							
			
						});
					
									
								
				
			})
			
			
	})
		
	
    
    
		
		
		
		
		
	
		
		
		
	}
};
//curl --data "amount=0.001&withdrawal=1P3S1grZYmcqYDuaEDVDYobJ5Fx85E9fE9&pair=clam_btc" https://shapeshift.io/sendamount

