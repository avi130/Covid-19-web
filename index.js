import fetch from 'node-fetch';
import express from 'express';
const app = express()
const port = 3000
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}))
app.use((express.json()))

var countries = [];
var deaths_list = [];


const api_url = 'https://covid-api.mmediagroup.fr/v1/history?country='
const country_url = 'https://restcountries.eu/rest/v2/alpha/';
// b62f88d9e484a5e3f2442ec62ea5a236


/* GET home page. */
app.get('/', function(req, res) {
  countries = [];
  deaths_list = [];
  res.render('index', { title: 'Daily new confirmed cases' });

});
/////routs 
app.get('/compare', function(req, res) {
  countries = [];
  deaths_list = [];
  res.render('compare', { title: 'Compare between two countries daily difference' });

});

app.get('/deaths', function(req, res) {
  res.render('deaths', { title: 'Number of COVID-19 deaths by country' });
});


/////outputs
app.post('/ans_confirmed',async function(req, res) {
  const {country, date} = req.body
  const ans = await ans_confirmed(country,date); 
  res.render('ans', { ans: ans });
});
  
app.post('/ans_compare',async function(req, res) {
  const {country1, country2 , from_date, to_date} = req.body
  const ans = await ans_compare(country1 , country2 ,from_date ,to_date); 
  res.render('ans', { ans: ans });
});


app.post('/ans_deaths',async function(req, res) {
  const {country1, country2 , from_date, to_date} = req.body
  //const ans = await ans3(country1 , country2 ,from_date ,to_date); 
  //res.render('ans', { ans: deaths_list });
  res.send(deaths_list)
});


app.post('/add_to_list',async function(req, res) {
    const add_country = req.body
    if(!countries.includes(add_country.add_country)){
      countries.push(add_country.add_country)
    }
    res.render('deaths', { title: 'Number of COVID-19 deaths by country' });
    });

app.post('/delete_from_list',async function(req, res) {
    const delete_country = req.body
    if(countries && countries.includes(delete_country.delete_country)){
      countries= countries.filter(item => item !== delete_country.delete_country)
    }
    res.render('deaths', { title: 'Number of COVID-19 deaths by country' });
    });

app.post('/list_deaths',async function(req, res) {
  const {add_country,delete_country} = req.body
  if (add_country ){
    countries.push(add_country)
  }
  else if(delete_country) { 
    countries= countries.filter(item => item !== country)
  }
  else{
    res.render('deaths_country_list', { ans: countries });
  }
  });


/// functions
async function ans_compare(input_country1, input_country2 ,from_date, to_date ) {
      var name = "Israel" //await getNameToCompare(input_country1,input_country2,from_date,to_date);
      var x= await getAnsCompare("Israel","Germany",from_date, to_date)
      return x
}


async function getNameToCompare(country1,country2,from_date,to_date) {
  const response_c1 = await fetch(country_url+country1);
  const response_c2 = await fetch(country_url+country2);
  const data_c1 = await response_c1.json();
  const name_c1 = data_c1.name;
  const data_c2 = await response_c2.json();
  const name_c2 = data_c2.name;
  return {name_c1, name_c2}
}

//func that gives us the confirmed number for both countries in every date in range with the given api.
async function getAnsCompare(name_c1, name_c2 ,from_date ,to_date) {
  console.log(name_c1);
  console.log(name_c2);
  const new_url_c1 = api_url+name_c1+'&status=confirmed';
  const new_url_c2 = api_url+name_c2+'&status=confirmed';

  const response_c1 = await fetch(new_url_c1);
  const response_c2 = await fetch(new_url_c2);

  const data_c1 = await response_c1.json();
  const data_c2 = await response_c2.json();

  const total_confirmed_c1 =  data_c1.All.dates[to_date];
  const total_confirmed_c2 =  data_c2.All.dates[to_date];

  const population_c1 =  data_c1.All.population;
  const population_c2 =  data_c2.All.population;
  console.log( population_c1 );
  console.log( population_c2 );


  var loop = new Date(to_date);
  var end = new Date(from_date);
  let first = [];
  let second = [];
  let ans = [];
  //create 2 arrays with all data for each date
  while(loop >= end){
     const date = formattedDate(loop);
     const confirmed_in_date_c1 =  data_c1.All.dates[date];
     const confirmed_in_date_c2 =  data_c2.All.dates[date];
     first.push(confirmed_in_date_c1);
     second.push(confirmed_in_date_c2);
     var newDate = loop.setDate(loop.getDate() -1);
     loop = new Date(newDate);
  }
  //calculate final answer
  for (let index = 0; index < first.length; index++) {
      const confirmed_1 = first[index];
      const confirmed_2 = second[index];
      var num =(confirmed_1/population_c1 - confirmed_2/population_c2 );
      var n = parseFloat(num).toFixed(5); 
      ans.push(n+" ");
  }
  return ans
}











async function ans_confirmed(input_country,input_date ) {
      var name = "Israel" //await getNameToConfirmed(input_country);
      var x= await getAnsConfirmed(name,input_date)
      return x
}

//func that takes Alpha-3 code format and gives us full country name.
async function getNameToConfirmed(input_country) {
  try{
  const response = await fetch(country_url+input_country);
  const data = await response.json();
  const name = data.name;
  var x= country_url+input_country
  return name
  }
  catch (err) {
    console.error(err);
  }
}

async function getAnsConfirmed(fcountry,input_date) {
  const new_url = api_url+fcountry+'&status=confirmed';
  console.log("getting data..")
  console.log("")

  const response = await fetch(new_url);
  const data = await response.json();
  const total_confirmed = await data.All.dates[input_date];
  var date_day_before = new Date(input_date);
  date_day_before.setDate(date_day_before.getDate() - 1);
  date_day_before = formattedDate(date_day_before);
  const day_before_confirmed = await data.All.dates[date_day_before];
  console.log(total_confirmed-day_before_confirmed);
  var confirmed = total_confirmed-day_before_confirmed
  var ans = "On "+ input_date+" confirmed cases in "+fcountry+" was: "+ confirmed;

  return ans
}

//func that help to get date in the format that we need(when we change date).
function formattedDate(d) {
  let month = String(d.getMonth() + 1);
  let day = String(d.getDate());
  const year = String(d.getFullYear());

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return `${year}-${month}-${day}`;
}



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})