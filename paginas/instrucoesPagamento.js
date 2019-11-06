module.exports = {
	exibir: function (requisicao, cliente, dados, database, template) {
		
		//coletar pedacos do template
		template=template.split('{pedaco}');
		
		template[0]=template[0].replace(/{nome}/g, dados.nome);
		template[0]=template[0].replace(/{valor}/g, (dados.valor/1).toFixed(2).replace('.', ','));
		template[0]=template[0].replace(/{cpf}/g, dados.cpf);
		template[0]=template[0].replace(/{quantidade}/g, dados.quantidade);
		template[0]=template[0].replace(/{moeda}/g, dados.moeda);
		template[0]=template[0].replace(/{carteira}/g, dados.carteira);
		
		
		cliente.write(template[0]);
		cliente.end();
	}
};
