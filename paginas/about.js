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

			cliente.write(template[0]);
			cliente.end();



		}
	}

