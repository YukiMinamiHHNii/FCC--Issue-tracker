const express= require('express'),
			bodyParser= require('body-parser'),
			dotenv= require('dotenv').load(),
			helmet= require('helmet');

const app= express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(helmet.noSniff());

app.listen(process.env.SERVER_PORT);
console.log(`App listening on port ${process.env.SERVER_PORT}`);