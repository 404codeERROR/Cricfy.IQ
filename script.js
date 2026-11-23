// Cricfy.iq front-end. Player statistics are loaded from the generated Cricsheet dataset.
const CRICFY_CRICSHEET=window.CRICFY_CRICSHEET;
if(!CRICFY_CRICSHEET)throw new Error('Cricsheet data failed to load; check assets/data/cricsheet-stats.js');
const CRICFY_API_BASE=['localhost','127.0.0.1'].includes(location.hostname)&&location.port!=='8000'?`${location.protocol}//${location.hostname}:8000`:'';
const cricfyApiUrl=path=>`${CRICFY_API_BASE}${path}`;
const CURRENT_YEAR=new Date().getFullYear();
const CURRENT_YEAR_START=`${CURRENT_YEAR}-01-01`;
const CRICFY_DATA_VERSION=CRICFY_CRICSHEET.meta.generatedAt||CRICFY_CRICSHEET.meta.dataThrough;
function loadLocalList(key){try{let value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return []}}

function initTheme(){
  let saved=localStorage.getItem('cricfy-theme');
  let root=document.documentElement;
  if(saved){root.setAttribute('data-theme',saved)}
  else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches){root.setAttribute('data-theme','light')}
  $('themeToggle').textContent=root.getAttribute('data-theme')==='light'?'☀️':'◐';
}
function toggleTheme(){
  let root=document.documentElement;
  let isLight=root.getAttribute('data-theme')==='light';
  root.setAttribute('data-theme',isLight?'':'light');
  localStorage.setItem('cricfy-theme',isLight?'':'light');
  $('themeToggle').textContent=isLight?'◐':'☀️';
}

function buildComparisonUrl(){
  let params=new URLSearchParams();
  if(chosen.length)params.set('players',chosen.join(','));
  if(format&&format!=='ODI')params.set('format',format);
  return location.pathname+'?'+params.toString();
}
function syncComparisonUrl(){
  try{history.replaceState(null,'',buildComparisonUrl())}catch{}
}
function applyComparisonUrl(){
  let params=new URLSearchParams(location.search);
  let playersParam=params.get('players');
  if(playersParam){
    let names=playersParam.split(',').map(n=>n.trim()).filter(Boolean);
    let valid=names.filter(n=>players[n]);
    if(valid.length)chosen=valid.slice(0,6);
  }
  let formatParam=params.get('format');
  if(formatParam&&['ODI','T20','Test'].includes(formatParam))format=formatParam;
}
const players = {
  "KL Rahul": {
    wiki: "KL Rahul",
    team: "India",
    role: "Batter / Wicketkeeper"
  },
  "Virat Kohli": {
    wiki: "Virat Kohli",
    team: "India",
    role: "Top-order Batter"
  },
  "Rohit Sharma": {
    wiki: "Rohit Sharma",
    team: "India",
    role: "Opening Batter"
  },
  "Abhishek Sharma": {
    wiki: "Abhishek Sharma",
    image: "https://static-files.cricket-australia.pulselive.com/headshots/440/2665-camedia.png",
    team: "India",
    role: "Opening Batter"
  },
  "Hardik Pandya": {
    wiki: "Hardik Pandya",
    team: "India",
    role: "All-rounder"
  },
  "Rishabh Pant": {
    wiki: "Rishabh Pant",
    team: "India",
    role: "Wicketkeeper Batter"
  },
  "Shubman Gill": {
    wiki: "Shubman Gill",
    team: "India",
    role: "Top-order Batter"
  },
  "Suryakumar Yadav": {
    wiki: "Suryakumar Yadav",
    team: "India",
    role: "Middle-order Batter"
  },
  "Jasprit Bumrah": {
    wiki: "Jasprit Bumrah",
    team: "India",
    role: "Fast Bowler"
  },
  "Mohammed Shami": {
    wiki: "Mohammed Shami",
    team: "India",
    role: "Fast Bowler"
  },
  "Ravindra Jadeja": {
    wiki: "Ravindra Jadeja",
    team: "India",
    role: "All-rounder"
  },
  "Rashid Khan": {
    wiki: "Rashid Khan",
    team: "Afghanistan",
    role: "Leg-spin Bowler / All-rounder"
  },
  "Shaheen Afridi": {
    wiki: "Shaheen Afridi",
    team: "Pakistan",
    role: "Fast Bowler"
  },
  "Mitchell Starc": {
    wiki: "Mitchell Starc",
    team: "Australia",
    role: "Fast Bowler"
  },
  "Trent Boult": {
    wiki: "Trent Boult",
    team: "New Zealand",
    role: "Fast Bowler"
  },
  "Kane Williamson": {
    wiki: "Kane Williamson",
    team: "New Zealand",
    role: "Top-order Batter"
  },
  "Joe Root": {
    wiki: "Joe Root",
    team: "England",
    role: "Top-order Batter"
  },
  "Babar Azam": {
    wiki: "Babar Azam",
    team: "Pakistan",
    role: "Top-order Batter"
  },
  "Steve Smith": {
    wiki: "Steve Smith (cricketer)",
    team: "Australia",
    role: "Batter"
  },
  "David Warner": {
    wiki: "David Warner (cricketer)",
    team: "Australia",
    role: "Opening Batter"
  },
  "Sachin Tendulkar": {
    wiki: "Sachin Tendulkar",
    team: "India",
    role: "Batter"
  },
  "MS Dhoni": {
    wiki: "MS Dhoni",
    team: "India",
    role: "Wicketkeeper Batter"
  },
  "Smriti Mandhana": {
    wiki: "Smriti Mandhana",
    team: "India Women",
    role: "Opening Batter"
  }
};
function inferPlayerRole(record){
  let formatValues=Object.values(record?.formats||{});
  let batting=formatValues.reduce((total,stats)=>total+(stats.matches||0),0);
  let bowling=formatValues.reduce((total,stats)=>total+(stats.wickets||0),0);
  let wicketkeeper=/wicket/i.test(record.name||'');
  if(wicketkeeper)return 'Wicketkeeper Batter';
  if(bowling>=25&&batting>=10)return 'All-rounder';
  if(bowling>=25)return 'Bowler';
  if(batting>=10)return 'Batter';
  return 'Cricket player';
}
function hydratePlayersFromCricsheet(){
  Object.values(CRICFY_CRICSHEET.players).forEach(record=>{
    if(!record?.name)return;
    if(players[record.name])return;
    let team=record.team||'International';
    players[record.name]={wiki:record.name,team,role:inferPlayerRole(record),description:`${team} cricket player · ${inferPlayerRole(record)} · Cricsheet international record`};
  });
}
hydratePlayersFromCricsheet();
function addTeamPlayerDirectory(team, entries){
  entries.forEach(entry=>{
    let [name,role]=entry;
    if(players[name])return;
    players[name]={wiki:name,team,role};
  });
}
addTeamPlayerDirectory('England',[
  ['Ben Stokes','All-rounder'],['Jos Buttler','Wicketkeeper Batter'],['Jofra Archer','Fast Bowler'],['Jonny Bairstow','Wicketkeeper Batter'],['Mark Wood','Fast Bowler'],
  ['Moeen Ali','All-rounder'],['Chris Woakes','All-rounder'],['Sam Curran','All-rounder'],['Harry Brook','Top-order Batter'],['Dawid Malan','Top-order Batter'],
  ['Liam Livingstone','Middle-order Batter'],['Phil Salt','Opening Batter'],['Ollie Pope','Top-order Batter'],['Zak Crawley','Opening Batter'],['Ben Duckett','Opening Batter'],
  ['Rehan Ahmed','Spin Bowler'],['Adil Rashid','Leg-spin Bowler'],['Tom Hartley','Spin Bowler'],['Gus Atkinson','Fast Bowler'],['Brydon Carse','Fast Bowler'],
  ['Jamie Smith','Wicketkeeper Batter'],['Shoaib Bashir','Spin Bowler'],['Matthew Potts','Fast Bowler'],['Dan Lawrence','Top-order Batter'],['Jack Leach','Spin Bowler']
]);
addTeamPlayerDirectory('Australia',[
  ['Pat Cummins','Fast Bowler'],['Travis Head','Opening Batter'],['Marnus Labuschagne','Top-order Batter'],['Mitchell Marsh','All-rounder'],['Glenn Maxwell','All-rounder'],
  ['Alex Carey','Wicketkeeper Batter'],['Josh Hazlewood','Fast Bowler'],['Adam Zampa','Leg-spin Bowler'],['Marcus Stoinis','All-rounder'],['Cameron Green','All-rounder'],
  ['Nathan Lyon','Off-spin Bowler'],['Sean Abbott','Fast Bowler'],['Josh Inglis','Wicketkeeper Batter'],['Jake Fraser-Mcgurk','Opening Batter'],['Matthew Short','All-rounder'],
  ['Ashton Agar','Spin Bowler'],['Matt Kuhnemann','Spin Bowler'],['Todd Murphy','Off-spin Bowler'],['Michael Neser','Fast Bowler'],['Aaron Hardie','All-rounder'],
  ['Spencer Johnson','Fast Bowler'],['Nathan Ellis','Fast Bowler'],['Beau Webster','All-rounder'],['Jhye Richardson','Fast Bowler'],['Peter Handscomb','Top-order Batter']
]);
addTeamPlayerDirectory('South Africa',[
  ['Aiden Markram','Top-order Batter'],['Kagiso Rabada','Fast Bowler'],['Quinton de Kock','Wicketkeeper Batter'],['Temba Bavuma','Top-order Batter'],['Keshav Maharaj','Spin Bowler'],
  ['Marco Jansen','All-rounder'],['Heinrich Klaasen','Wicketkeeper Batter'],['Rassie van der Dussen','Top-order Batter'],['Gerald Coetzee','Fast Bowler'],['David Miller','Middle-order Batter'],
  ['Lungi Ngidi','Fast Bowler'],['Anrich Nortje','Fast Bowler'],['Tristan Stubbs','Middle-order Batter'],['Reeza Hendricks','Opening Batter'],['Ryan Rickelton','Wicketkeeper Batter'],
  ['Tabraiz Shamsi','Spin Bowler'],['Wiaan Mulder','All-rounder'],['Bjorn Fortuin','Spin Bowler'],['Ottniel Baartman','Fast Bowler'],['Nandre Burger','Fast Bowler'],
  ['Tony de Zorzi','Opening Batter'],['Kyle Verreynne','Wicketkeeper Batter'],['Dwaine Pretorius','All-rounder'],['George Linde','Spin Bowler'],['Corbin Bosch','All-rounder']
]);
addTeamPlayerDirectory('New Zealand',[
  ['Devon Conway','Wicketkeeper Batter'],['Tim Southee','Fast Bowler'],['Tom Latham','Wicketkeeper Batter'],['Daryl Mitchell','All-rounder'],['Glenn Phillips','All-rounder'],
  ['Rachin Ravindra','All-rounder'],['Matt Henry','Fast Bowler'],['Ish Sodhi','Leg-spin Bowler'],['Kyle Jamieson','Fast Bowler'],['Lockie Ferguson','Fast Bowler'],
  ['Mitchell Santner','All-rounder'],['Finn Allen','Opening Batter'],['James Neesham','All-rounder'],['Will Young','Top-order Batter'],['Michael Bracewell','All-rounder'],
  ['Mark Chapman','Middle-order Batter'],['Cole McConchie','All-rounder'],['Ajaz Patel','Spin Bowler'],['Nathan Smith','All-rounder'],['William O’Rourke','Fast Bowler'],
  ['Ben Sears','Fast Bowler'],['Tim Robinson','Top-order Batter'],['Jacob Duffy','Fast Bowler'],['Tom Blundell','Wicketkeeper Batter'],['Henry Nicholls','Top-order Batter']
]);
addTeamPlayerDirectory('Pakistan',[
  ['Mohammad Rizwan','Wicketkeeper Batter'],['Shaheen Shah Afridi','Fast Bowler'],['Mohammad Nawaz','All-rounder'],['Fakhar Zaman','Opening Batter'],['Imam-ul-Haq','Top-order Batter'],
  ['Shadab Khan','Leg-spin Bowler'],['Naseem Shah','Fast Bowler'],['Harif Rauf','Fast Bowler'],['Agha Salman','All-rounder'],['Saim Ayub','Opening Batter'],
  ['Abdullah Shafique','Top-order Batter'],['Saud Shakeel','Top-order Batter'],['Abrar Ahmed','Leg-spin Bowler'],['Ihsanullah','Fast Bowler'],['Usama Mir','Leg-spin Bowler'],
  ['Azam Khan','Wicketkeeper Batter'],['Mohammad Haris','Wicketkeeper Batter'],['Mohammad Wasim Jr','Fast Bowler'],['Zaman Khan','Fast Bowler'],['Faheem Ashraf','All-rounder'],
  ['Kamran Ghulam','Top-order Batter'],['Aamer Jamal','All-rounder'],['Shahnawaz Dahani','Fast Bowler'],['Iftikhar Ahmed','All-rounder'],['Sarfaraz Ahmed','Wicketkeeper Batter']
]);
addTeamPlayerDirectory('Bangladesh',[
  ['Najmul Hossain Shanto','Top-order Batter'],['Mehidy Hasan Miraz','All-rounder'],['Taskin Ahmed','Fast Bowler'],['Litton Das','Wicketkeeper Batter'],['Shakib Al Hasan','All-rounder'],
  ['Tanzid Hasan','Opening Batter'],['Towhid Hridoy','Middle-order Batter'],['Mustafizur Rahman','Fast Bowler'],['Taijul Islam','Spin Bowler'],['Rishad Hossain','Leg-spin Bowler'],
  ['Tanzim Hasan Sakib','Fast Bowler'],['Hasan Mahmud','Fast Bowler'],['Jaker Ali','Wicketkeeper Batter'],['Mahmudullah','Middle-order Batter'],['Mushfiqur Rahim','Wicketkeeper Batter'],
  ['Soumya Sarkar','Opening Batter'],['Shoriful Islam','Fast Bowler'],['Nasum Ahmed','Spin Bowler'],['Afif Hossain','All-rounder'],['Tanvir Islam','Spin Bowler'],
  ['Zakir Hasan','Top-order Batter'],['Nayeem Hasan','Spin Bowler'],['Nahid Rana','Fast Bowler'],['Mohammad Naim','Opening Batter'],['Anamul Haque','Wicketkeeper Batter']
]);
addTeamPlayerDirectory('Afghanistan',[
  ['Rahmanullah Gurbaz','Wicketkeeper Batter'],['Azmatullah Omarzai','All-rounder'],['Ibrahim Zadran','Opening Batter'],['Mohammad Nabi','All-rounder'],['Mujeeb Ur Rahman','Off-spin Bowler'],
  ['Naveen-ul-Haq','Fast Bowler'],['Fazalhaq Farooqi','Fast Bowler'],['Hashmatullah Shahidi','Top-order Batter'],['Najibullah Zadran','Middle-order Batter'],['Noor Ahmad','Spin Bowler'],
  ['Ikram Alikhil','Wicketkeeper Batter'],['Darwish Rasooli','Top-order Batter'],['Rahmat Shah','Top-order Batter'],['Gulbadin Naib','All-rounder'],['Karim Janat','All-rounder'],
  ['Qais Ahmad','Leg-spin Bowler'],['Zahir Khan','Spin Bowler'],['Fareed Ahmad','Fast Bowler'],['Nijat Masood','Fast Bowler'],['Sediqullah Atal','Opening Batter'],
  ['Sharafuddin Ashraf','All-rounder'],['Zubaid Akbari','Opening Batter'],['Abdul Malik','Top-order Batter'],['Allah Mohammad Ghazanfar','Off-spin Bowler'],['Mohammad Ishaq','Wicketkeeper Batter']
]);
addTeamPlayerDirectory('Sri Lanka',[
  ['Charith Asalanka','All-rounder'],['Wanindu Hasaranga','Leg-spin Bowler'],['Kusal Mendis','Wicketkeeper Batter'],['Pathum Nissanka','Opening Batter'],['Dushmantha Chameera','Fast Bowler'],
  ['Maheesh Theekshana','Off-spin Bowler'],['Dilshan Madushanka','Fast Bowler'],['Kamindu Mendis','All-rounder'],['Dhananjaya de Silva','All-rounder'],['Dasun Shanaka','All-rounder'],
  ['Matheesha Pathirana','Fast Bowler'],['Janith Liyanage','Middle-order Batter'],['Sadeera Samarawickrama','Wicketkeeper Batter'],['Prabath Jayasuriya','Spin Bowler'],['Lahiru Kumara','Fast Bowler'],
  ['Angelo Mathews','All-rounder'],['Dimuth Karunaratne','Opening Batter'],['Kusal Perera','Wicketkeeper Batter'],['Niroshan Dickwella','Wicketkeeper Batter'],['Vishwa Fernando','Fast Bowler'],
  ['Kasun Rajitha','Fast Bowler'],['Asitha Fernando','Fast Bowler'],['Oshada Fernando','Top-order Batter'],['Nuwan Thushara','Fast Bowler'],['Dunith Wellalage','Spin Bowler']
]);
addTeamPlayerDirectory('West Indies',[
  ['Shai Hope','Wicketkeeper Batter'],['Nicholas Pooran','Wicketkeeper Batter'],['Shimron Hetmyer','Top-order Batter'],['Alzarri Joseph','Fast Bowler'],['Akeal Hosein','Spin Bowler'],
  ['Rovman Powell','Middle-order Batter'],['Brandon King','Opening Batter'],['Gudakesh Motie','Spin Bowler'],['Romario Shepherd','All-rounder'],['Andre Russell','All-rounder'],
  ['Sherfane Rutherford','Middle-order Batter'],['Johnson Charles','Opening Batter'],['Shamar Joseph','Fast Bowler'],['Jason Holder','All-rounder'],['Keacy Carty','Top-order Batter'],
  ['Matthew Forde','Fast Bowler'],['Evin Lewis','Opening Batter'],['Kyle Mayers','All-rounder'],['Kemar Roach','Fast Bowler'],['Jayden Seales','Fast Bowler'],
  ['Alick Athanaze','Top-order Batter','West Indies'],['Joshua Da Silva','Wicketkeeper Batter'],['Tagenarine Chanderpaul','Opening Batter'],['Kevin Sinclair','Off-spin Bowler'],['Kirk McKenzie','Top-order Batter']
]);
addTeamPlayerDirectory('Ireland',[
  ['Paul Stirling','Opening Batter'],['Andy Balbirnie','Top-order Batter'],['Harry Tector','Middle-order Batter'],['Lorcan Tucker','Wicketkeeper Batter'],['Josh Little','Fast Bowler'],
  ['Curtis Campher','All-rounder'],['George Dockrell','Spin Bowler'],['Mark Adair','All-rounder'],['Craig Young','Fast Bowler'],['Barry McCarthy','Fast Bowler'],
  ['Gareth Delany','All-rounder'],['Andrew McBrine','Spin Bowler'],['Benjamin White','Leg-spin Bowler'],['Neil Rock','Wicketkeeper Batter'],['Stephen Doheny','Opening Batter']
]);
addTeamPlayerDirectory('Zimbabwe',[
  ['Sikandar Raza','All-rounder'],['Craig Ervine','Top-order Batter'],['Blessing Muzarabani','Fast Bowler'],['Brian Bennett','Opening Batter'],['Tadiwanashe Marumani','Wicketkeeper Batter'],
  ['Sean Williams','All-rounder'],['Richard Ngarava','Fast Bowler'],['Clive Madande','Wicketkeeper Batter'],['Brandon Mavuta','Leg-spin Bowler'],['Wellington Masakadza','Spin Bowler'],
  ['Joylord Gumbie','Wicketkeeper Batter'],['Johnathan Campbell','All-rounder'],['Dion Myers','Top-order Batter'],['Faraz Akram','All-rounder'],['Luke Jongwe','All-rounder']
]);
addTeamPlayerDirectory('Nepal',[
  ['Rohit Paudel','Top-order Batter'],['Aasif Sheikh','Wicketkeeper Batter'],['Dipendra Singh Airee','All-rounder'],['Sandeep Lamichhane','Leg-spin Bowler'],['Kushal Bhurtel','Opening Batter'],
  ['Kushal Malla','All-rounder'],['Sompal Kami','Fast Bowler'],['Bhuwan Karki','Fast Bowler'],['Karan KC','All-rounder'],['Gulsan Jha','All-rounder'],
  ['Aarif Sheikh','Middle-order Batter'],['Bimal Singh','Top-order Batter'],['Lalit Rajbanshi','Spin Bowler'],['Pratis GC','Fast Bowler'],['Dev Khanal','Top-order Batter']
]);
addTeamPlayerDirectory('Netherlands',[
  ['Scott Edwards','Wicketkeeper Batter'],['Bas de Leede','All-rounder'],['Max O’Dowd','Opening Batter'],['Paul van Meekeren','Fast Bowler'],['Logan van Beek','All-rounder'],
  ['Aryan Dutt','Off-spin Bowler'],['Vikramjit Singh','Opening Batter'],['Teja Nidamanuru','Middle-order Batter'],['Saqlain Mushtaq','Spin Bowler'],['Fred Klaassen','Fast Bowler'],
  ['Tim Pringle','Spin Bowler'],['Michael Levitt','Opening Batter'],['Sybrand Engelbrecht','Top-order Batter'],['Kyle Klein','Fast Bowler'],['Ryan Klein','All-rounder']
]);
addTeamPlayerDirectory('United States',[
  ['Monank Patel','Wicketkeeper Batter'],['Aaron Jones','Middle-order Batter'],['Steven Taylor','Opening Batter'],['Ali Khan','Fast Bowler'],['Jessy Singh','Fast Bowler'],
  ['Nisarg Patel','Spin Bowler'],['Corey Anderson','All-rounder'],['Saurabh Netravalkar','Fast Bowler'],['Shayan Jahangir','Wicketkeeper Batter'],['Shadley van Schalkwyk','All-rounder'],
  ['Milind Kumar','Top-order Batter'],['Gajanand Singh','Top-order Batter'],['Andries Gous','Wicketkeeper Batter'],['Saiteja Mukkamalla','Top-order Batter'],['Nosthush Kenjige','Spin Bowler']
]);
addTeamPlayerDirectory('United Arab Emirates',[
  ['Muhammad Waseem','Opening Batter'],['Rahul Chopra','Wicketkeeper Batter'],['Alishan Sharafu','Opening Batter'],['Basil Hameed','All-rounder'],['Junaid Siddique','Fast Bowler'],
  ['Tanish Suri','Wicketkeeper Batter'],['Aayan Afzal Khan','Spin Bowler'],['Zahoor Khan','Fast Bowler'],['Aryansh Sharma','Wicketkeeper Batter'],['Muhammad Jawadullah','Fast Bowler']
]);
addTeamPlayerDirectory('Scotland',[
  ['Richie Berrington','All-rounder'],['Matthew Cross','Wicketkeeper Batter'],['George Munsey','Opening Batter'],['Bradley Currie','Fast Bowler'],['Mark Watt','Spin Bowler'],
  ['Michael Leask','All-rounder'],['Brandon McMullen','All-rounder'],['Chris Greaves','All-rounder'],['Safyaan Sharif','Fast Bowler'],['Hamza Tahir','Spin Bowler']
]);
addTeamPlayerDirectory('Oman',[
  ['Jatinder Singh','Opening Batter'],['Aqib Ilyas','Top-order Batter'],['Ayaan Khan','All-rounder'],['Bilal Khan','Fast Bowler'],['Shakeel Ahmed','Spin Bowler'],
  ['Zeeshan Maqsood','All-rounder'],['Mohammad Nadeem','All-rounder'],['Fayyaz Butt','Fast Bowler'],['Kaleemullah','Fast Bowler'],['Samay Shrivastava','Spin Bowler']
]);
addTeamPlayerDirectory('Namibia',[
  ['Gerhard Erasmus','All-rounder'],['David Wiese','All-rounder'],['Jan Frylinck','All-rounder'],['JJ Smit','All-rounder'],['Ruben Trumpelmann','Fast Bowler'],
  ['Michael van Lingen','Opening Batter'],['Zane Green','Wicketkeeper Batter'],['Bernard Scholtz','Spin Bowler'],['Tangeni Lungameni','Fast Bowler'],['Ben Shikongo','Fast Bowler']
]);
addTeamPlayerDirectory('India Women',[
  ['Harmanpreet Kaur','All-rounder'],['Smriti Mandhana','Opening Batter'],['Shafali Verma','Opening Batter'],['Jemimah Rodrigues','Top-order Batter'],['Deepti Sharma','All-rounder'],
  ['Renuka Singh','Fast Bowler'],['Richa Ghosh','Wicketkeeper Batter'],['Harleen Deol','Top-order Batter'],['Radha Yadav','Spin Bowler'],['Pooja Vastrakar','All-rounder'],
  ['Yastika Bhatia','Wicketkeeper Batter'],['Shreyanka Patil','Spin Bowler'],['Sneh Rana','All-rounder'],['Asha Sobhana','Leg-spin Bowler'],['Taniya Bhatia','Wicketkeeper Batter'],
  ['Priya Punia','Top-order Batter'],['S Sajana','All-rounder'],['Saika Ishaque','Spin Bowler'],['Arundhati Reddy','Fast Bowler'],['Raghvi Bist','Top-order Batter'],
  ['Uma Chetry','Wicketkeeper Batter'],['Titas Sadhu','Fast Bowler'],['Mansi Joshi','Fast Bowler'],['Meghna Singh','Fast Bowler'],['Kanika Ahuja','All-rounder']
]);
addTeamPlayerDirectory('Australia Women',[
  ['Alyssa Healy','Wicketkeeper Batter'],['Ellyse Perry','All-rounder'],['Meg Lanning','Top-order Batter'],['Beth Mooney','Wicketkeeper Batter'],['Ash Gardner','All-rounder'],
  ['Tahlia McGrath','All-rounder'],['Darcie Brown','Fast Bowler'],['Phoebe Litchfield','Opening Batter'],['Annabel Sutherland','All-rounder'],['Alana King','Leg-spin Bowler'],
  ['Grace Harris','All-rounder'],['Georgia Wareham','Leg-spin Bowler'],['Jess Jonassen','All-rounder'],['Kim Garth','All-rounder'],['Sophie Molineux','Spin Bowler'],
  ['Georgia Voll','Top-order Batter'],['Nicole Bolton','Top-order Batter'],['Megan Schutt','Fast Bowler'],['Tayla Vlaeminck','Fast Bowler'],['Heather Graham','All-rounder'],
  ['Lydia Greenway','Top-order Batter'],['Courtney Webb','Top-order Batter'],['Lauren Cheatle','Fast Bowler'],['Rachel Trenaman','Top-order Batter'],['Holly Ferling','Fast Bowler']
]);
addTeamPlayerDirectory('England Women',[
  ['Heather Knight','All-rounder'],['Nat Sciver-Brunt','All-rounder'],['Danni Wyatt-Hodge','Opening Batter'],['Amy Jones','Wicketkeeper Batter'],['Sophia Dunkley','Top-order Batter'],
  ['Sophie Ecclestone','Spin Bowler'],['Charlie Dean','Off-spin Bowler'],['Lauren Bell','Fast Bowler'],['Alice Capsey','All-rounder'],['Sarah Glenn','Leg-spin Bowler'],
  ['Maia Bouchier','Opening Batter'],['Freya Kemp','All-rounder'],['Issy Wong','Fast Bowler'],['Lauren Filer','Fast Bowler'],['Mahika Gaur','Fast Bowler'],
  ['Kate Cross','Fast Bowler'],['Linsey Smith','Spin Bowler'],['Tammy Beaumont','Opening Batter'],['Paige Scholfield','All-rounder'],['Bess Heath','Wicketkeeper Batter'],
  ['Grace Scrivens','All-rounder'],['Emma Lamb','Top-order Batter'],['Lauren Winfield-Hill','Wicketkeeper Batter'],['Sophie Luff','Top-order Batter'],['Hannah Baker','Leg-spin Bowler']
]);
addTeamPlayerDirectory('New Zealand Women',[
  ['Sophie Devine','All-rounder'],['Suzie Bates','Opening Batter'],['Amelia Kerr','Leg-spin Bowler'],['Leigh Kasperek','Off-spin Bowler'],['Lauren Down','Top-order Batter'],
  ['Melie Kerr','All-rounder'],['Maddy Green','Top-order Batter'],['Brooke Halliday','All-rounder'],['Katey Martin','Wicketkeeper Batter'],['Jess Kerr','Fast Bowler'],
  ['Fran Jonas','Spin Bowler'],['Hayley Jensen','All-rounder'],['Rosemary Mair','Fast Bowler'],['Georgia Plimmer','Opening Batter'],['Bella Armstrong','Top-order Batter'],
  ['Izzy Gaze','Wicketkeeper Batter'],['Hannah Rowe','Fast Bowler'],['Bernadine Bezuidenhout','Wicketkeeper Batter'],['Eden Carson','Spin Bowler'],['Jac Kerr','Fast Bowler'],
  ['Natalie Dodd','Opening Batter'],['Lea Tahuhu','Fast Bowler'],['Polly Inglis','Wicketkeeper Batter'],['Olivia Bremner','Top-order Batter'],['Emma McLeod','Top-order Batter']
]);
addTeamPlayerDirectory('South Africa Women',[
  ['Laura Wolvaardt','Opening Batter'],['Marizanne Kapp','All-rounder'],['Tazmin Brits','Opening Batter'],['Chloe Tryon','All-rounder'],['Ayabonga Khaka','Fast Bowler'],
  ['Sune Luus','Leg-spin Bowler'],['Nadine de Klerk','All-rounder'],['Nonkululeko Mlaba','Spin Bowler','South Africa Women'],['Sinalo Jafta','Wicketkeeper Batter'],['Anneke Bosch','Top-order Batter'],
  ['Delmi Tucker','All-rounder'],['Masabata Klaas','Fast Bowler'],['Tumi Sekhukhune','Fast Bowler'],['Mieke de Ridder','Wicketkeeper Batter'],['Nondumiso Shangase','Spin Bowler'],
  ['Faye Tunnicliffe','Wicketkeeper Batter'],['Lara Goodall','Top-order Batter'],['Dane van Niekerk','All-rounder'],['Shabnim Ismail','Fast Bowler'],['Lizelle Lee','Opening Batter'],
  ['Annerie Dercksen','All-rounder'],['Leah Jones','Top-order Batter'],['Seshnie Naidu','Leg-spin Bowler'],['Jana Terblanche','Top-order Batter'],['Oluhle Siyo','Fast Bowler']
]);
addTeamPlayerDirectory('Pakistan Women',[
  ['Bismah Maroof','Top-order Batter'],['Sidra Ameen','Opening Batter'],['Nida Dar','All-rounder'],['Aliya Riaz','All-rounder'],['Fatima Sana','All-rounder'],
  ['Sidra Nawaz','Wicketkeeper Batter'],['Sadia Iqbal','Spin Bowler'],['Natalia Pervaiz','All-rounder'],['Muneeba Ali','Wicketkeeper Batter'],['Diana Baig','Fast Bowler'],
  ['Nashra Sandhu','Spin Bowler'],['Tuba Hassan','Leg-spin Bowler'],['Sydra Amin','Opening Batter'],['Iram Javed','Top-order Batter'],['Gull Feroza','Wicketkeeper Batter'],
  ['Shawaal Zulfiqar','Top-order Batter'],['Ayesha Zafar','Opening Batter'],['Rameen Shamim','Spin Bowler'],['Aimen Anwar','Fast Bowler'],['Umm-e-Hani','Spin Bowler']
]);
addTeamPlayerDirectory('Sri Lanka Women',[
  ['Chamari Athapaththu','Opening Batter'],['Harshitha Samarawickrama','Top-order Batter'],['Kavisha Dilhari','All-rounder'],['Nilakshi de Silva','Middle-order Batter'],['Inoka Ranaweera','Spin Bowler'],
  ['Sugandika Kumari','Spin Bowler'],['Anushka Sanjeewani','Wicketkeeper Batter'],['Vishmi Gunaratne','Opening Batter'],['Kavindi Keerthirathna','Spin Bowler'],['Achini Kulasuriya','Fast Bowler'],
  ['Oshadi Ranasinghe','All-rounder'],['Hasini Perera','Top-order Batter'],['Sathya Sandeepani','Spin Bowler'],['Umesha Thimashini','Fast Bowler'],['Ama Kanchana','All-rounder']
]);
addTeamPlayerDirectory('Bangladesh Women',[
  ['Nigar Sultana','Wicketkeeper Batter'],['Murshida Khatun','Opening Batter'],['Fargana Hoque','Top-order Batter'],['Nahida Akter','Spin Bowler'],['Ritu Moni','All-rounder'],
  ['Salma Khatun','All-rounder'],['Shorna Akter','All-rounder'],['Sobhana Mostary','Top-order Batter'],['Rabeya Khan','Leg-spin Bowler'],['Shamima Sultana','Wicketkeeper Batter'],
  ['Sanjida Akter','Top-order Batter'],['Marufa Akter','Fast Bowler'],['Dilara Akter','Wicketkeeper Batter'],['Jahanara Alam','Fast Bowler'],['Rumana Ahmed','All-rounder']
]);
addTeamPlayerDirectory('West Indies Women',[
  ['Hayley Matthews','All-rounder'],['Stafanie Taylor','All-rounder'],['Deandra Dottin','All-rounder'],['Qiana Joseph','Fast Bowler'],['Zaida James','All-rounder'],
  ['Shemaine Campbelle','Wicketkeeper Batter'],['Afy Fletcher','Leg-spin Bowler'],['Shamilia Connell','Fast Bowler'],['Karishma Ramharack','Spin Bowler'],['Chinelle Henry','All-rounder'],
  ['Rashada Williams','Wicketkeeper Batter'],['Jannillea Glasgow','All-rounder'],['Cherry-Ann Fraser','Fast Bowler'],['Chedean Nation','Middle-order Batter'],['Aaliyah Alleyne','All-rounder']
]);
addTeamPlayerDirectory('Ireland Women',[
  ['Gaby Lewis','Opening Batter'],['Laura Delany','All-rounder'],['Orla Prendergast','All-rounder'],['Amy Hunter','Wicketkeeper Batter'],['Louise Little','All-rounder'],
  ['Arlene Kelly','Fast Bowler'],['Leah Paul','All-rounder'],['Cara Murray','Spin Bowler'],['Rebecca Stokell','Top-order Batter'],['Alana Tyndall','Fast Bowler']
]);
const colors=['#4b91ff','#ff9b45','#48d079','#a66bff','#f25e8c','#36d0e4'];
let chosen=['KL Rahul','Abhishek Sharma','Hardik Pandya','Rishabh Pant'];let format='ODI';let matchupSelection=null,matchupFormat='ODI';let savedPlayers=loadLocalList('cricfy-saved-players');let savedComparisons=loadLocalList('cricfy-saved-comparisons');let activePage='comparison';let charts={};let photoCache={'Abhishek Sharma':players['Abhishek Sharma'].image};
const pendingPhotoRequests=new Map(),queuedPhotoNames=new Set(),photoQueue=[];
let photoWorkers=0;
let directoryPlayers=[];let directoryLoaded=false;let directoryLoading=false;let directoryVisible=48;
let liveMatches=[];let matchesRefreshTimer=null;let matchesUpdatedAt='';let matchesLoading=false;let matchesLoadState='idle';let matchesLoadError='';let followedTeams=loadLocalList('cricfy-followed-teams');let followedMatches=loadLocalList('cricfy-followed-matches');let matchSnapshots=loadLocalList('cricfy-match-snapshots');
let statsVersionTimer=null;
let statsVisible=100;
let bowlerVisible=100;
let gamePlayerLane=68,gamePlayerStep=0,gameSelectedIntent=4,gameRunIntent=false,gameDeliveryTimer=0,gameAnimationFrame=0,gameSwingTimer=0;
const GAME_OVERS=5,GAME_SHOTS=[0,1,2,3,4,6];
const GAME_SHOT_LABELS={0:'Defend',1:'Rotate strike',2:'Work the gap',3:'Run hard',4:'Drive for four',6:'Go for six'};
const GAME_DELIVERIES={
  0:{label:'Yorker',icon:'↘',difficulty:.12},
  1:{label:'Good length',icon:'◉',difficulty:.08},
  2:{label:'Bouncer',icon:'↗',difficulty:.09},
  3:{label:'Off spin',icon:'〰',difficulty:.07},
  4:{label:'Slower ball',icon:'⏱',difficulty:.1},
  6:{label:'Wide yorker',icon:'⇘',difficulty:.11}
};
let gameState={player:chosen[0],userBowler:'',opponentCountry:'',opponentBatter:'',bowler:'',currentBatter:chosen[0],innings:1,runs:0,wickets:0,balls:0,active:false,phase:'ready',firstInnings:null,history:[],message:'Choose your batter, a bowler, and an opposing country to set up a five-over match.'};
const GOOGLE_CRICKET_LIVE_URL='https://www.google.com/search?igu=1&q=cricket+all+live&oq=&gs_lcrp=EgZjaHJvbWUqBggCEEUYOzISCAAQABgUGIMBGIcCGLEDGIAEMgYIARAjGCcyBggCEEUYOzIGCAMQRRg5MgYIBBAFGEAyBggFEEUYPTIGCAYQRRg9MgYIBxBFGDzSAQg1MDQ2ajBqNKgCALACAQ&sourceid=chrome&source=chrome.ob&ie=UTF-8#cobssid=s&sie=lg;/g/11ybbzm0qn;5;/m/021q23;mt;fp;1;;;;-1';
const MATCHDEKHO_LIVE_URL='https://matchdekho.in/';
const $=id=>document.getElementById(id);
const fmt=n=>n===null||n===undefined||!Number.isFinite(Number(n))?'—':Number(n).toLocaleString('en-IN');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const COUNTRY_CODES={
  'Afghanistan':'AF','Argentina':'AR','Australia':'AU','Austria':'AT','Bahamas':'BS','Bahrain':'BH','Bangladesh':'BD','Barbados':'BB','Belgium':'BE','Belize':'BZ','Bermuda':'BM','Bhutan':'BT','Botswana':'BW','Brazil':'BR','Bulgaria':'BG','Cambodia':'KH','Cameroon':'CM','Canada':'CA','Cayman Islands':'KY','Chile':'CL','China':'CN','Cook Islands':'CK','Costa Rica':'CR','Croatia':'HR','Cyprus':'CY','Czech Republic':'CZ','Denmark':'DK','England':'GB','Estonia':'EE','Eswatini':'SZ','Fiji':'FJ','Finland':'FI','France':'FR','Gambia':'GM','Germany':'DE','Ghana':'GH','Gibraltar':'GI','Greece':'GR','Guernsey':'GG','Hong Kong':'HK','Hungary':'HU','India':'IN','Indonesia':'ID','Iran':'IR','Ireland':'IE','Isle of Man':'IM','Israel':'IL','Italy':'IT','Ivory Coast':'CI','Japan':'JP','Jersey':'JE','Kenya':'KE','Kuwait':'KW','Lesotho':'LS','Luxembourg':'LU','Malawi':'MW','Malaysia':'MY','Maldives':'MV','Mali':'ML','Malta':'MT','Mexico':'MX','Mongolia':'MN','Mozambique':'MZ','Myanmar':'MM','Namibia':'NA','Nepal':'NP','Netherlands':'NL','New Zealand':'NZ','Nigeria':'NG','Norway':'NO','Oman':'OM','Pakistan':'PK','Panama':'PA','Papua New Guinea':'PG','Peru':'PE','Philippines':'PH','Portugal':'PT','Qatar':'QA','Romania':'RO','Rwanda':'RW','Samoa':'WS','Saudi Arabia':'SA','Scotland':'GB','Serbia':'RS','Seychelles':'SC','Sierra Leone':'SL','Singapore':'SG','Slovenia':'SI','South Africa':'ZA','South Korea':'KR','Spain':'ES','Sri Lanka':'LK','St Helena':'SH','Suriname':'SR','Swaziland':'SZ','Sweden':'SE','Switzerland':'CH','Tanzania':'TZ','Thailand':'TH','Timor-Leste':'TL','Turkey':'TR','Turks and Caicos Island':'TC','Uganda':'UG','United Arab Emirates':'AE','UAE':'AE','United States':'US','United States of America':'US','USA':'US','Uzbekistan':'UZ','Vanuatu':'VU','West Indies':'', 'ICC World XI':'','Zambia':'ZM','Zimbabwe':'ZW'
};
const COUNTRY_FLAG_CODES={England:'gb-eng',Scotland:'gb-sct',Wales:'gb-wls'};
function countryCodeForTeam(team){
  let country=String(team||'').replace(/ Women$/,'').replace(/^(A|B|C|D) /,'').trim(),code=COUNTRY_CODES[country];
  if(!code){let record=Object.values(CRICFY_CRICSHEET.players).find(item=>item.team===team);code=record?COUNTRY_CODES[record.team?.replace(/ Women$/,'')]:null}
  return code||'';
}
function countryFlag(team){
  let code=countryCodeForTeam(team);
  if(!code)return '🌐';
  return String.fromCodePoint(...[...code].map(char=>127397+char.charCodeAt()));
}
function flagHtml(team,cls='country-flag'){
  let country=String(team||'').replace(/ Women$/,'').trim(),code=COUNTRY_FLAG_CODES[country]||countryCodeForTeam(team);
  if(!code)return `<span class="${escapeHtml(cls)} country-flag-fallback" role="img" aria-label="${escapeHtml(team||'International')}">🌐</span>`;
  return `<img class="${escapeHtml(cls)}" src="https://flagcdn.com/w40/${escapeHtml(code.toLowerCase())}.png" alt="${escapeHtml(team||'International')} flag" loading="lazy" decoding="async">`;
}
async function checkCricsheetVersion(){
  try{
    const response=await fetch(cricfyApiUrl('/api/stats-version'),{cache:'no-store'});
    if(!response.ok)return false;
    const payload=await response.json();
    if(!payload.ok)return false;
    if(payload.version&&payload.version!==CRICFY_DATA_VERSION){
      location.reload();
      return true;
    }
    return true;
  }catch(error){
    console.warn('Automatic Cricsheet update check failed.',error);
    return false;
  }
}
async function startCricsheetVersionMonitor(){
  if(location.protocol==='file:')return;
  if(await checkCricsheetVersion()&&!statsVersionTimer){
    statsVersionTimer=setInterval(checkCricsheetVersion,5*60*1000);
  }
}
async function refreshLiveData(button){
  if(location.protocol==='file:'){
    toast('Start the Cricfy live server to refresh Cricsheet data');
    return;
  }
  if(button)button.disabled=true;
  toast('Refreshing Cricsheet data...');
  try{
    let response=await fetch(cricfyApiUrl('/api/refresh'),{method:'POST'});
    let payload;
    try{
      payload=await response.json();
    }catch{
      throw new Error('Refresh requires the Cricfy Python server. Run python tools\\live_server.py and open the app at http://127.0.0.1:8000.');
    }
    if(!payload||typeof payload!=='object')throw new Error('The refresh server returned an invalid response. Restart tools\\live_server.py and try again.');
    if(!response.ok||!payload.ok)throw new Error(payload.message||'Refresh failed');
    toast('Data refreshed. Reloading...');
    setTimeout(()=>location.reload(),700);
  }catch(error){
    toast(error.message||'Unable to refresh live data');
  }finally{
    if(button)button.disabled=false;
  }
}
function normalizePlayerName(value){return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function cricsheetRecordFor(name){
  let normalized=normalizePlayerName(name),ids=CRICFY_CRICSHEET.nameIndex[normalized]||[];
  if(ids.length===0){
    let parts=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().match(/[a-z0-9]+/g)||[];
    let shortName=parts.length>1?normalizePlayerName(parts[0][0]+parts[parts.length-1]):'';
    ids=CRICFY_CRICSHEET.initialLastIndex[shortName]||[];
  }
  if(ids.length===1)return CRICFY_CRICSHEET.players[ids[0]]||null;
  let team=normalizePlayerName(players[name]?.team||'');
  if(team){
    let teamMatches=ids.filter(id=>normalizePlayerName(CRICFY_CRICSHEET.players[id]?.team||'')===team);
    if(teamMatches.length===1)return CRICFY_CRICSHEET.players[teamMatches[0]];
  }
  return null;
}
function battingStats(name,selectedFormat=format){
  let record=cricsheetRecordFor(name),stats=record?.formats?.[selectedFormat];
  return stats&&stats.matches>0?stats:null;
}
function bowlingStats(name,selectedFormat=format){
  let record=cricsheetRecordFor(name),stats=record?.formats?.[selectedFormat];
  return stats&&stats.bowlingMatches>0?stats:null;
}
const sOf=name=>{let s=battingStats(name);return s?[s.matches,s.runs,s.average,s.strikeRate,s.high,s.centuries,s.fifties,s.fours,s.sixes]:Array(9).fill(null)};
function toast(msg){let t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2300)}
function getFallback(name){
  let initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="48" fill="#16324f"/><circle cx="256" cy="180" r="92" fill="#2b5477"/><path d="M92 512c12-126 69-190 164-190s152 64 164 190" fill="#2b5477"/><text x="256" y="470" text-anchor="middle" fill="#edf6ff" font-family="Arial,sans-serif" font-size="56" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
async function photoFor(name){
  if(photoCache[name])return photoCache[name];
  if(pendingPhotoRequests.has(name))return pendingPhotoRequests.get(name);
  let request=(async()=>{
    try{
      let cached=localStorage.getItem(`cricfy-photo:${name}`);
      if(cached){photoCache[name]=cached;return cached}
    }catch{}
    if(players[name]?.image){photoCache[name]=players[name].image;return photoCache[name]}
    let person=players[name]?.wiki||name;
    let titles=[...new Set([person,`${name} (cricketer)`,name])];
    try{
      let url=`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=500&titles=${encodeURIComponent(titles.join('|'))}&redirects=1&origin=*`;
      let response=await fetch(url);
      if(!response.ok)throw new Error(`Wikipedia image lookup returned ${response.status}`);
      let data=await response.json();
      let page=Object.values(data.query?.pages||{}).find(candidate=>!candidate.missing&&candidate.thumbnail?.source);
      if(!page){
        let searchUrl=`https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(`${person} cricketer`)}&gsrlimit=6&prop=pageimages&piprop=thumbnail&pithumbsize=500&origin=*`;
        let searchResponse=await fetch(searchUrl);
        if(searchResponse.ok){
          let searchData=await searchResponse.json(),candidates=Object.values(searchData.query?.pages||{}).filter(candidate=>candidate.thumbnail?.source);
          let exact=candidates.find(candidate=>normalizePlayerName(candidate.title.replace(/\s+\([^)]*\)$/,''))===normalizePlayerName(name));
          let cricketer=candidates.find(candidate=>/\(cricketer\)$/i.test(candidate.title));
          page=exact||cricketer;
        }
      }
      if(page){
        photoCache[name]=page.thumbnail.source;
        try{localStorage.setItem(`cricfy-photo:${name}`,page.thumbnail.source)}catch{}
        return photoCache[name];
      }
    }catch(error){
      console.warn(`Player photo lookup failed for ${name}.`,error);
    }
    return getFallback(name);
  })();
  pendingPhotoRequests.set(name,request);
  try{return await request}
  finally{pendingPhotoRequests.delete(name)}
}
function imgHtml(name,cls='player-photo'){
  let src=photoCache[name]||players[name]?.image||getFallback(name);
  return `<img class="${escapeHtml(cls)}" src="${escapeHtml(src)}" data-person="${escapeHtml(name)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">`;
}
document.addEventListener('error',event=>{
  let image=event.target;
  if(!(image instanceof HTMLImageElement)||!image.dataset.person)return;
  let name=image.dataset.person,fallback=getFallback(name);
  if(image.src===fallback)return;
  console.warn(`Player photo failed to display for ${name}.`);
  delete photoCache[name];
  try{localStorage.removeItem(`cricfy-photo:${name}`)}catch{}
  image.src=fallback;
},true);
function updatePhotoImages(name,src){
  document.querySelectorAll('img[data-person]').forEach(image=>{
    if(image.dataset.person===name&&image.src!==src)image.src=src;
  });
}
function processPhotoQueue(){
  while(photoWorkers<4&&photoQueue.length){
    let name=photoQueue.shift();
    queuedPhotoNames.delete(name);
    photoWorkers++;
    photoFor(name)
      .then(src=>updatePhotoImages(name,src))
      .catch(error=>console.warn(`Unable to load player photo for ${name}.`,error))
      .finally(()=>{photoWorkers--;processPhotoQueue()});
  }
}
function enqueuePhoto(name){
  if(photoCache[name]||pendingPhotoRequests.has(name)||queuedPhotoNames.has(name))return;
  queuedPhotoNames.add(name);
  photoQueue.push(name);
  processPhotoQueue();
}
const playerPhotoObserver=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    playerPhotoObserver.unobserve(entry.target);
    enqueuePhoto(entry.target.dataset.person);
  });
},{rootMargin:'220px 0px'});
function refreshPhotos(names){
  let requestedNames=new Set(names);
  document.querySelectorAll('img[data-person]').forEach(image=>{
    let name=image.dataset.person;
    if(!requestedNames.has(name))return;
    let cached=photoCache[name]||players[name]?.image;
    if(cached){image.src=cached;return}
    if(playerPhotoObserver)playerPhotoObserver.observe(image);
    else enqueuePhoto(name);
  });
}
function recentFor(name,selectedFormat=format){return battingStats(name,selectedFormat)?.recent||[]}
function recentHtml(name,selectedFormat=format){
  let innings=recentFor(name,selectedFormat);
  if(!innings.length)return '<div class="recent-form" aria-label="Recent batting innings"><span class="recent-empty">No recorded innings</span></div>';
  let latest=innings.map(innings=>{
    let score=`${innings.runs}${innings.notOut?'*':''}`,description=`${innings.date}${innings.opponent?` vs ${innings.opponent}`:''} · ${innings.balls} balls · ${innings.notOut?'Not out':'Out'}`;
    return `<span class="${innings.runs>=55?'recent-good':innings.runs<25?'recent-low':''}" title="${description}">${score}</span>`;
  }).join('');
  return `<div class="recent-form" aria-label="Recent batting innings">${latest}</div>`;
}
function playerTile(name,i){let st=sOf(name);return `<div class="player-tile">${imgHtml(name)}<div class="player-details"><div class="player-name">${flagHtml(players[name].team)} ${name}</div><div class="player-meta">${players[name].team} · ${players[name].role}</div><div class="tile-recent"><span>Recent</span>${recentHtml(name)}</div><select class="tile-format" data-format-person="${name}"><option ${format==='ODI'?'selected':''}>ODI</option><option ${format==='T20'?'selected':''}>T20</option><option ${format==='Test'?'selected':''}>Test</option></select></div><button class="remove-btn" data-remove="${name}" title="Remove player">×</button>${i<chosen.length-1?'<span class="versus">VS</span>':''}</div>`}
function metricsFor(name){let s=sOf(name);return [['♧','Matches',fmt(s[0]),'In source coverage'],['🏏','Runs',fmt(s[1]),'In source matches'],['▥','Average',fmt(s[2]),'Batting average'],['ϟ','Strike Rate',fmt(s[3]),'Runs per 100 balls'],['🏆','Highest Score',fmt(s[4]),'Best innings'],['◎','100s / 50s',`${fmt(s[5])} / ${fmt(s[6])}`,'Centuries / fifties'],['▤','Fours / Sixes',`${fmt(s[7])} / ${fmt(s[8])}`,'Boundaries'] ]}
function metricsHtml(){if(!chosen.length)return '<div class="comparison-metrics-empty">Select a player to see sourced statistics.</div>';return `<div class="comparison-metric-groups">${chosen.map(name=>`<section class="comparison-metric-group"><h3 class="comparison-metric-title">${escapeHtml(name)} <span>${escapeHtml(format)} · sourced stats</span></h3><div class="metric-grid">${metricsFor(name).map((x,i)=>`<div class="metric" style="--accent:${colors[i%colors.length]}"><span class="metric-icon">${x[0]}</span><div class="metric-label">${x[1]}</div><div class="metric-value">${x[2]}</div><div class="metric-sub">${x[3]}</div></div>`).join('')}</div></section>`).join('')}</div>`}
function chartsHtml(){return `<div class="charts-grid"><article class="panel chart-panel"><div class="panel-head"><div><h2>Key Metrics Comparison</h2><p>Recorded international matches · ${CRICFY_CRICSHEET.meta.source}</p></div><span class="pill">COMPARISON</span></div><div class="chart-box"><canvas id="metricsChart"></canvas></div></article><article class="panel chart-panel"><div class="panel-head"><div><h2>Recent Performance</h2><p>Latest five innings in this format</p></div><div class="trend-tabs"><button class="active" data-trend="runs">Runs</button><button data-trend="average">Average</button><button data-trend="strike">Strike</button></div></div><div class="chart-box"><canvas id="trendChart"></canvas></div></article><article class="panel chart-panel"><div class="panel-head"><div><h2>Runs vs Strike Rate</h2><p>Actual totals from source matches</p></div></div><div class="chart-box"><canvas id="scatterChart"></canvas></div></article></div>`}
function tableHtml(){return `<article class="panel table-panel"><div class="panel-head"><div><h2>Detailed Statistics <span style="color:#8ba6c3;font-size:10px">(${format})</span></h2><p>International ${format} records from Cricsheet through ${CRICFY_CRICSHEET.meta.dataThrough}. — means no record in this source.</p></div><button class="btn btn-small export-btn" id="exportCsv">⇩ Export CSV</button></div><div class="table-wrap"><table><thead><tr><th>PLAYER</th><th>MATCHES</th><th>RUNS</th><th>AVERAGE</th><th>STRIKE RATE</th><th>HIGHEST</th><th>RECENT FORM</th><th>100s</th><th>50s</th><th>FOURS</th><th>SIXES</th></tr></thead><tbody>${chosen.map(n=>{let s=sOf(n);return `<tr><td><div class="table-name">${imgHtml(n,'')} ${flagHtml(players[n].team)} ${n}</div></td>${[0,1,2,3,4].map(i=>`<td>${fmt(s[i])}</td>`).join('')}<td>${recentHtml(n)}</td>${[5,6,7,8].map(i=>`<td>${fmt(s[i])}</td>`).join('')}</tr>`}).join('')}</tbody></table></div></article>`}
function radarHtml(){return `<article class="panel chart-panel"><div class="panel-head"><div><h2>Performance Radar</h2><p>Normalized player attributes</p></div></div><div class="chart-box radar-box"><canvas id="radarChart"></canvas></div></article>`}
function directoryPage(){
  return `<section class="directory-intro panel">
    <div><div class="eyebrow"><i></i> PLAYER DIRECTORY · A–Z</div><h2>Explore cricket profiles</h2><p>Browse all ${Object.keys(CRICFY_CRICSHEET.players).length.toLocaleString()} players represented in Cricsheet. Records are grouped by country and sorted alphabetically; unavailable figures are shown as —.</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" id="refreshDirectory">↻ Refresh profiles</button><button class="btn btn-secondary" id="refreshLiveData">⬇ Refresh live data</button></div>
  </section>
  <section class="directory-toolbar panel">
    <div class="directory-search"><span>⌕</span><input id="directorySearch" placeholder="Search name or profile description..." autocomplete="off"></div>
    <select id="directoryGender" class="select-control"><option value="">All players</option><option value="male">Men</option><option value="female">Women</option></select>
    <select id="directoryRecency" class="select-control"><option value="${CURRENT_YEAR}">Active in ${CURRENT_YEAR}</option><option value="">All years</option></select>
    <select id="directoryCountry" class="select-control"><option value="">All profiles</option><option value="India">India</option><option value="Australia">Australia</option><option value="England">England</option><option value="Pakistan">Pakistan</option><option value="New Zealand">New Zealand</option><option value="South Africa">South Africa</option><option value="Sri Lanka">Sri Lanka</option><option value="Bangladesh">Bangladesh</option><option value="Afghanistan">Afghanistan</option><option value="West Indies">West Indies</option><option value="Ireland">Ireland</option><option value="Zimbabwe">Zimbabwe</option><option value="Nepal">Nepal</option><option value="Netherlands">Netherlands</option><option value="United States">United States</option><option value="United Arab Emirates">United Arab Emirates</option><option value="Scotland">Scotland</option><option value="Oman">Oman</option><option value="Namibia">Namibia</option><optgroup label="Women's teams"><option value="India Women">India Women</option><option value="Australia Women">Australia Women</option><option value="England Women">England Women</option><option value="New Zealand Women">New Zealand Women</option><option value="South Africa Women">South Africa Women</option><option value="Pakistan Women">Pakistan Women</option><option value="Sri Lanka Women">Sri Lanka Women</option><option value="Bangladesh Women">Bangladesh Women</option><option value="West Indies Women">West Indies Women</option><option value="Ireland Women">Ireland Women</option></optgroup></select>
    <select id="directoryFormat" class="select-control"><option>ODI</option><option>T20</option><option>Test</option></select>
    <select id="directorySort" class="select-control"><option value="name">Sort: Name A–Z</option><option value="runs">Sort: Runs</option><option value="average">Sort: Average</option><option value="recent">Sort: Recent innings</option></select>
  </section>
  <div class="directory-status" id="directoryStatus">Directory not loaded. Choose “Load player directory”.</div>
  <div class="directory-grid" id="directoryGrid"></div>
  <div class="directory-load-wrap"><button class="btn btn-secondary" id="directoryLoadMore" style="display:none">Load more players</button></div>`;
}
function ensureDirectoryStats(name){
  if(!players[name]){
    let profile=directoryPlayers.find(p=>p.title===name);
    let record=cricsheetRecordFor(name);
    players[name]={wiki:name,team:profile?.country||record?.team||'International',role:profile?.role||'Cricket player',description:profile?.description||''};
  }
  return players[name];
}
function loadCricsheetDirectory(){
  if(directoryLoading)return;
  directoryLoading=true;
  directoryPlayers=Object.values(CRICFY_CRICSHEET.players).map(record=>{
    let role=players[record.name]?.role||inferPlayerRole(record);
    let team=record.team||'International';
    return {
      title:record.name,
      description:`${team} · ${role} · International Test, ODI and T20 records`,
      image:'',
      country:team,
      role
    };
  }).sort((a,b)=>a.title.localeCompare(b.title));
  let sourcedNames=new Set(directoryPlayers.map(profile=>normalizePlayerName(profile.title)));
  Object.keys(players).forEach(name=>{
    if(sourcedNames.has(normalizePlayerName(name)))return;
    let record=cricsheetRecordFor(name);
    if(!record)return;
    let team=record.team||players[name].team||'International';
    directoryPlayers.push({
      title:name,
      description:`${team} · ${players[name].role||inferPlayerRole(record)} · International Test, ODI and T20 records`,
      image:players[name].image||'',
      country:team,
      role:players[name].role||inferPlayerRole(record)
    });
  });
  directoryPlayers.sort((a,b)=>a.title.localeCompare(b.title));
  directoryPlayers.forEach(profile=>{
    if(!players[profile.title]){
      players[profile.title]={wiki:profile.title,team:profile.country,role:profile.role,description:profile.description};
    }
  });
  directoryLoaded=true;
  directoryLoading=false;
  updateDirectoryCountryOptions();
  renderDirectory();
}
async function loadWikipediaDirectory(){
  if(directoryLoading)return;
  directoryLoading=true;
  directoryLoaded=false;
  $('directoryStatus').textContent='Loading up to 2,000 cricket profiles from Wikipedia...';
  $('directoryGrid').innerHTML='';
  directoryPlayers=[];
  let seen=new Set();
  let categories=[
    'Category:Cricketers',
    'Category:Indian cricketers',
    'Category:Australian cricketers',
    'Category:English cricketers',
    'Category:Pakistani cricketers',
    'Category:New Zealand cricketers',
    'Category:South African cricketers',
    'Category:Sri Lankan cricketers',
    'Category:West Indian cricketers',
    'Category:Bangladeshi cricketers',
    'Category:Afghan cricketers',
    'Category:Zimbabwean cricketers',
    'Category:Irish cricketers',
    'Category:Welsh cricketers',
    'Category:Scottish cricketers',
    'Category:Women cricketers'
  ];
  try{
    for(let category of categories){
      if(directoryPlayers.length>=2000)break;
      let continueParam='';
      for(let pageNumber=0;pageNumber<10&&directoryPlayers.length<2000;pageNumber++){
        let url=`https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmnamespace=0&cmlimit=500${continueParam}&origin=*`;
        let response=await fetch(url);
        if(!response.ok)throw new Error('Wikipedia category request failed');
        let data=await response.json();
        let members=(data.query?.categorymembers||[]);
        let titles=[];
        for(let member of members){
          if(!seen.has(member.title)){seen.add(member.title);titles.push(member.title)}
          if(directoryPlayers.length+titles.length>=2000)break;
        }
        for(let start=0;start<titles.length;start+=50){
          await collectWikipediaProfiles(titles.slice(start,start+50));
          if(directoryPlayers.length>=2000)break;
        }
        $('directoryStatus').textContent=`Loaded ${directoryPlayers.length.toLocaleString()} profiles from ${category.replace('Category:','')}...`;
        let continuation=data.continue?.cmcontinue;
        if(!continuation)break;
        continueParam=`&cmcontinue=${encodeURIComponent(continuation)}`;
      }
    }
  }catch(error){
    $('directoryStatus').textContent=`Wikipedia loading stopped: ${error.message}`;
  }
  if(directoryPlayers.length===0){
    await loadWikipediaSearchFallback();
  }
  directoryLoaded=true;
  directoryLoading=false;
  renderDirectory();
}
function rText(value){return value.replace(/<[^>]*>/g,' ')}
async function collectWikipediaProfile(title){
  try{
    let url=`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages|description&exintro=1&explaintext=1&exsentences=3&pithumbsize=500&piprop=thumbnail&titles=${encodeURIComponent(title)}&origin=*`;
    let response=await fetch(url);
    let data=await response.json();
    let page=Object.values(data.query?.pages||{})[0];
    if(!page||page.missing||/disambiguation/i.test(page.description||''))return;
    let text=`${title} ${page.description||''} ${page.extract||''}`;
    directoryPlayers.push({
      title:page.title,
      description:rText(page.description||page.extract||'Wikipedia cricket profile').slice(0,220),
      image:page.thumbnail?.source||'',
      country:detectCountry(text),
      role:detectRole(text)
    });
  }catch{}
}
async function collectWikipediaProfiles(titles){
  if(!titles.length)return;
  try{
    let url=`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages|description&exintro=1&explaintext=1&exsentences=2&pithumbsize=500&piprop=thumbnail&titles=${encodeURIComponent(titles.join('|'))}&origin=*`;
    let response=await fetch(url);
    let data=await response.json();
    Object.values(data.query?.pages||{}).forEach(page=>{
      if(!page||page.missing||/disambiguation/i.test(page.description||''))return;
      let text=`${page.title||''} ${page.description||''} ${page.extract||''}`;
      if(!/\b(cricket|cricketer|batter|bowler|wicketkeeper|wicket-keeper|batting|all-rounder)\b/i.test(text))return;
      directoryPlayers.push({
        title:page.title,
        description:rText(page.description||page.extract||'Wikipedia cricket profile').slice(0,220),
        image:page.thumbnail?.source||'',
        country:detectCountry(text),
        role:detectRole(text)
      });
    });
  }catch{}
}
async function loadWikipediaSearchFallback(){
  let searches=['international cricketer','cricket captain','cricket bowler','cricket batter','women cricketer'];
  for(let search of searches){
    if(directoryPlayers.length>=2000)break;
    let url=`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(search)}&srnamespace=0&srlimit=500&origin=*`;
    try{
      let response=await fetch(url);
      let data=await response.json();
      let titles=(data.query?.search||[]).map(result=>result.title);
      for(let start=0;start<titles.length;start+=50){
        await collectWikipediaProfiles(titles.slice(start,start+50));
        if(directoryPlayers.length>=2000)break;
      }
    }catch{}
  }
}
function detectCountry(text){
  let countries=['South Africa','Sri Lanka','West Indies','New Zealand','Australia','England','Pakistan','Bangladesh','Afghanistan','Ireland','Zimbabwe','Nepal','Netherlands','United States','United Arab Emirates','Scotland','Oman','Namibia','India'];
  let found=countries.find(country=>text.toLowerCase().includes(country.toLowerCase()));
  return found||'International';
}
function detectRole(text){
  let lower=text.toLowerCase();
  if(lower.includes('wicket-keeper')||lower.includes('wicketkeeper'))return 'Wicketkeeper';
  if(lower.includes('all-rounder')||lower.includes('all rounder'))return 'All-rounder';
  if(lower.includes('bowler'))return 'Bowler';
  if(lower.includes('batter')||lower.includes('batsman'))return 'Batter';
  return 'Cricket player';
}
function renderDirectory(){
  if(!$('directoryGrid'))return;
  if(!directoryPlayers.length){
    $('directoryStatus').textContent=directoryLoading?'Loading profiles...':'No profiles loaded.';
    return;
  }
  let query=$('directorySearch')?.value.toLowerCase().trim()||'';
  let country=$('directoryCountry')?.value||'';
  let gender=$('directoryGender')?.value||'';
  let recency=$('directoryRecency')?.value||'';
  let sort=$('directorySort')?.value||'name';
  let selectedFormat=$('directoryFormat')?.value||'ODI';
  let profiles=directoryPlayers.filter(profile=>{
    let matches=!query||`${profile.title} ${profile.description} ${profile.role}`.toLowerCase().includes(query);
    let countryMatches=!country||profile.country===country;
    return matches&&countryMatches&&directoryProfileMatchesFilters(profile,gender,recency,selectedFormat);
  });
  profiles.sort((a,b)=>{
    if(sort==='runs')return (battingStats(b.title,selectedFormat)?.runs??-1)-(battingStats(a.title,selectedFormat)?.runs??-1);
    if(sort==='average')return (battingStats(b.title,selectedFormat)?.average??-1)-(battingStats(a.title,selectedFormat)?.average??-1);
    if(sort==='recent'){
      let recentScore=p=>recentFor(p,selectedFormat).reduce((sum,innings)=>sum+innings.runs,0);
      return recentScore(b.title)-recentScore(a.title);
    }
    return a.title.localeCompare(b.title);
  });
  let visible=profiles.slice(0,directoryVisible);
  $('directoryStatus').textContent=profiles.length
    ?`Showing ${visible.length.toLocaleString()} of ${profiles.length.toLocaleString()} profiles · ${selectedFormat} international stats through ${CRICFY_CRICSHEET.meta.dataThrough} · — means unavailable`
    :'No profiles match these filters. Try another country, format, or activity year.';
  $('directoryGrid').innerHTML=visible.map(profile=>{
    let stats=battingStats(profile.title,selectedFormat);
    let image=profile.image||getFallback(profile.title);
    ensureDirectoryStats(profile.title);
    return `<article class="panel directory-card">
      <div class="directory-photo-wrap"><img src="${image}" alt="${profile.title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${getFallback(profile.title)}'"></div>
      <div class="directory-card-body"><div class="directory-card-head"><div><h3>${flagHtml(profile.country)} ${profile.title}</h3><p>${profile.country} · ${profile.role}</p></div><button class="btn btn-small btn-primary" data-directory-add="${profile.title}" title="Add to comparison">＋ Add</button></div>
      <p class="directory-description">${profile.description}</p>
      <div class="directory-stats"><span><small>${selectedFormat} matches</small><b>${fmt(stats?.matches)}</b></span><span><small>Runs</small><b>${fmt(stats?.runs)}</b></span><span><small>Average</small><b>${fmt(stats?.average)}</b></span></div>
      <div class="directory-recent"><span>Recent ${selectedFormat} innings</span>${recentHtml(profile.title,selectedFormat)}</div></div>
    </article>`;
  }).join('');
  let loadMore=$('directoryLoadMore');
  loadMore.style.display=visible.length<profiles.length?'inline-block':'none';
  refreshPhotos(visible.map(profile=>profile.title));
  document.querySelectorAll('[data-directory-add]').forEach(button=>button.onclick=()=>{
    let name=button.dataset.directoryAdd;
    ensureDirectoryStats(name);
    if(!chosen.includes(name)&&chosen.length<6){chosen.push(name);toast(`${name} added to comparison`);button.textContent='Added';}
    else if(chosen.includes(name))toast(`${name} is already selected`);
    else toast('You can compare up to 6 players');
  });
}
function directoryProfileMatchesFilters(profile,gender,recency,selectedFormat){
  let record=cricsheetRecordFor(profile.title);
  if(gender&&record?.gender!==gender)return false;
  if(!recency)return true;
  let stats=record?.formats?.[selectedFormat];
  let latestActivity=[stats?.lastBattingDate,stats?.lastBowlingDate].filter(Boolean).sort().pop()||'';
  return latestActivity>=`${recency}-01-01`;
}
function updateDirectoryCountryOptions(){
  let select=$('directoryCountry');
  if(!select)return;
  let selected=select.value;
  let gender=$('directoryGender')?.value||'';
  let recency=$('directoryRecency')?.value||'';
  let selectedFormat=$('directoryFormat')?.value||'ODI';
  let availableByCountry=new Map();
  directoryPlayers.forEach(profile=>{
    if(!directoryProfileMatchesFilters(profile,gender,recency,selectedFormat))return;
    availableByCountry.set(profile.country,(availableByCountry.get(profile.country)||0)+1);
  });
  let countries=[...new Set(directoryPlayers.map(profile=>profile.country))].sort((a,b)=>a.localeCompare(b));
  let totalAvailable=[...availableByCountry.values()].reduce((sum,count)=>sum+count,0);
  select.innerHTML=`<option value="">All available countries (${totalAvailable.toLocaleString()})</option>`+countries.map(country=>{
    let count=availableByCountry.get(country)||0;
    return `<option value="${escapeHtml(country)}" ${count===0?'disabled':''}>${countryFlag(country)} ${escapeHtml(country)} (${count.toLocaleString()} available)</option>`;
  }).join('');
  if(selected&&availableByCountry.has(selected))select.value=selected;
  else select.value='';
}
function comparisonPage(){return `<div class="panel players-panel"><div class="section-heading"><div><h2>Compare Players</h2><p>Choose players, switch format, then compare performance.</p></div><button class="btn btn-primary" id="addPlayer">＋ Add Player</button></div><div class="players-grid">${chosen.map(playerTile).join('')}</div><div class="toolbar"><button class="btn btn-primary" id="compareNow">▥ Compare Now</button><button class="btn btn-secondary" id="resetPlayers">↻ Reset Players</button><button class="btn btn-secondary" id="copyComparisonLink">🔗 Copy link</button><button class="btn btn-secondary" id="exportComparisonPdf">⇩ Export PDF</button><span class="format-label">MATCH FORMAT</span><select id="formatSelect" class="select-control"><option ${format==='ODI'?'selected':''}>ODI</option><option ${format==='T20'?'selected':''}>T20</option><option ${format==='Test'?'selected':''}>Test</option></select></div></div>${metricsHtml()}${chartsHtml()}<div class="bottom-grid">${tableHtml()}${radarHtml()}</div>`}
function homePage(){
  let modelAccuracy=evaluatePrototype('ODI','male');
  let withinTen=modelAccuracy.withinTen===null?'—':`${modelAccuracy.withinTen.toFixed(1)}%`;
  return `<div class="home-layout"><article class="panel home-feature"><div class="section-heading"><div><h2>Explore Players</h2><p>Choose a player to open their profile analysis.</p></div><button class="btn btn-primary" id="homeAdd">＋ Add player</button></div><div class="quick-player-grid">${Object.keys(players).slice(0,9).map(n=>`<div class="quick-player" data-open-player="${n}">${imgHtml(n,'')}<div><strong>${n}</strong><small>${players[n].team}</small>${recentHtml(n)}</div></div>`).join('')}</div></article><aside class="home-stats"><div class="panel home-stat"><div class="num">${Object.keys(CRICFY_CRICSHEET.players).length.toLocaleString()}</div><p>Players in sourced dataset</p></div><div class="panel home-stat"><div class="num">3</div><p>Formats: Test · ODI · T20</p></div><div class="panel home-stat"><div class="num">4</div><p>Interactive chart types</p></div><div class="panel home-stat"><div class="num">${withinTen}</div><p>Men’s ODI model accuracy · predictions within ±10 runs (${fmt(modelAccuracy.count)} tests)</p><button class="btn btn-secondary" data-goto="prediction">View backtest</button></div><div class="panel home-feature" style="grid-column:1/-1"><h2>Quick start</h2><p style="color:var(--muted);font-size:10px;line-height:1.8">Search a player using the top search box or explore comparisons, sourced stats, and prototype forecasts.</p><button class="btn btn-secondary" data-goto="comparison">Open Player Comparison →</button><button class="btn btn-secondary" data-goto="prediction" style="margin-left:6px">View Model Evaluation →</button></div></aside></div>`
}
function teamPage(){
  let sourceTeams=[...new Set(Object.values(CRICFY_CRICSHEET.players).map(record=>record.team).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  let teams=sourceTeams.filter(team=>!team.endsWith(' Women'));
  let womenTeams=sourceTeams.filter(team=>team.endsWith(' Women'));
  return `<div class="panel team-selector"><strong style="font-size:11px">Select national team</strong><select id="teamSelect" class="select-control">${teams.map(team=>`<option value="${escapeHtml(team)}">${countryFlag(team)} ${escapeHtml(team)}</option>`).join('')}<optgroup label="Women's teams">${womenTeams.map(team=>`<option value="${escapeHtml(team)}">${countryFlag(team)} ${escapeHtml(team)}</option>`).join('')}</optgroup></select><span style="font-size:9px;color:var(--muted)">International player profiles and sourced statistics</span></div><div id="teamContent"></div>`
}
function bestXIPage(){
  let teams=[...new Set(activeXiRecords('ODI','male').map(record=>{
    let team=record.team||'';
    return team.replace(/ Women$/,'');
  }).filter(team=>team&&team!=='Mixed'))].sort((a,b)=>a.localeCompare(b));
  return `<div class="section-heading"><div><h2>Best XI Builder</h2><p>Rankings use recorded players for the selected country, gender and format. Each role provides the top ranked player plus 2–5 alternates.</p></div></div><div class="panel" style="margin-bottom:12px"><div class="toolbar" style="margin:0"><select id="xiGender" class="select-control"><option value="male">Men</option><option value="female">Women</option></select><select id="xiTeam" class="select-control"><option value="">All countries</option>${teams.map(team=>`<option value="${team}">${countryFlag(team)} ${team}</option>`).join('')}</select><select id="xiFormat" class="select-control"><option>ODI</option><option>T20</option><option>Test</option></select><button class="btn btn-primary" id="buildXI">✦ Build best XI</button></div></div><div class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>ROLE</th><th>PLAYER / RANKED SELECTION</th><th>RUNS</th><th>AVG</th><th>RECENT FORM</th><th>WICKETS</th><th>ECONOMY</th></tr></thead><tbody id="xiBody"><tr><td colspan="7" style="text-align:center;color:var(--muted)">Choose gender, country and format, then build the XI.</td></tr></tbody></table></div></div>`;
}
function matchesPage(){return `
<section class="panel matches-intro">
  <div><div class="eyebrow"><i></i> LIVE CRICKET · TEST · ODI · T20</div><h2>Live Scores &amp; Fixtures</h2><p>Follow Google Cricket live scores, current matches and upcoming fixtures.</p></div>
  <div class="matches-intro-actions"><button class="btn btn-primary" id="refreshMatches">↻ Refresh scores</button></div>
</section>
<section class="live-source-grid">
  <article class="panel google-live-panel">
    <div class="live-source-icon google-icon">G</div>
    <div class="live-source-copy"><span>GOOGLE SPORTS</span><h2>Live scores &amp; next games</h2><p>View live cricket scores, match status, innings and upcoming schedules for all countries.</p></div>
    <a class="btn btn-primary" href="${GOOGLE_CRICKET_LIVE_URL}" target="_blank" rel="noopener noreferrer">Open Google Cricket ↗</a>
  </article>
  <article class="panel matchdekho-live-panel">
    <div class="live-source-icon">▶</div>
    <div class="live-source-copy"><span>MATCHDEKHO</span><h2>Watch live cricket</h2><p>Open official match viewing links and explore current cricket events.</p></div>
    <a class="btn btn-primary" href="${MATCHDEKHO_LIVE_URL}" target="_blank" rel="noopener noreferrer">Watch live matches ↗</a>
  </article>
</section>
<section class="panel google-score-panel">
  <div class="panel-head"><div><h2>Google Live Cricket Scores</h2><p>Google match center embedded on this page</p></div><a class="btn btn-small btn-secondary" href="${GOOGLE_CRICKET_LIVE_URL}" target="_blank" rel="noopener noreferrer">Open full screen ↗</a></div>
  <iframe class="google-score-frame" src="${GOOGLE_CRICKET_LIVE_URL}" title="Google live cricket scores" loading="lazy" scrolling="no" referrerpolicy="no-referrer-when-downgrade"></iframe>
</section>
<section class="panel match-player-panel">
  <div class="panel-head"><div><h2>Live Match Player</h2><p>MatchDekho live player embedded on this page</p></div><a class="btn btn-small btn-secondary" href="${MATCHDEKHO_LIVE_URL}" target="_blank" rel="noopener noreferrer">Open MatchDekho ↗</a></div>
  <iframe id="matchPlayerFrame" class="match-player-frame" src="${MATCHDEKHO_LIVE_URL}" title="MatchDekho live cricket player" loading="lazy" scrolling="no" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="no-referrer"></iframe>
</section>
<section class="panel matches-toolbar"><select id="matchesFormat" class="select-control" aria-label="Filter match format"><option value="">All formats</option><option>Test</option><option>ODI</option><option>T20</option></select><select id="matchesState" class="select-control" aria-label="Filter match status"><option value="">Live and upcoming</option><option value="live">Live now</option><option value="upcoming">Upcoming</option></select><span id="matchesUpdated" class="matches-updated">Checking live match availability…</span></section>
<div id="matchesStatus" class="matches-status" role="status">Match availability will appear here. Configure the optional CricketData API key to load match cards.</div>
<div id="matchesGrid" class="matches-grid"></div>
<p class="matches-disclaimer">Google and MatchDekho are external providers. Match cards and filter availability are supplied by CricketData; coverage depends on the configured account plan.</p>`}
function statsPage(){return `<div class="section-heading"><div><h2>Cricket Statistics Hub</h2><p>Cricsheet international match records through ${CRICFY_CRICSHEET.meta.dataThrough}; — means unavailable.</p></div><div style="display:flex;gap:8px"><button class="btn btn-secondary" id="statsRefresh">⬇ Refresh live data</button><button class="btn btn-secondary" id="statsExport">⇩ Export full CSV</button></div></div><div class="panel table-panel"><div class="toolbar" style="margin:0 0 12px"><input id="statsFilter" class="select-control" placeholder="Filter player name..." style="min-width:170px"><select id="statsFormat" class="select-control"><option>ODI</option><option>T20</option><option>Test</option></select><select id="statsSort" class="select-control"><option value="name">Name A–Z</option><option value="runs">Sort by Runs</option><option value="avg">Sort by Average</option><option value="strike">Sort by Strike Rate</option><option value="matches">Sort by Matches</option></select><select id="statsOpposition" class="select-control"><option value="">All opposition</option></select></div><div class="table-wrap"><table><thead><tr><th>PLAYER</th><th>TEAM</th><th>MATCHES</th><th>RUNS</th><th>AVERAGE</th><th>STRIKE RATE</th><th>HIGH SCORE</th><th>RECENT FORM</th></tr></thead><tbody id="statsBody"></tbody></table></div><button class="btn btn-secondary" id="statsLoadMore" style="width:100%;margin-top:10px">Load more batting records</button></div><div class="panel table-panel" style="margin-top:12px"><div class="section-heading" style="margin-bottom:12px"><div><h2>Bowling Statistics</h2><p>Wickets, economy, bowling average and strike rate from source matches.</p></div></div><div class="toolbar" style="margin:0 0 12px"><input id="bowlerFilter" class="select-control" placeholder="Filter bowler name..." style="min-width:190px"><select id="bowlerFormat" class="select-control"><option>ODI</option><option>T20</option><option>Test</option></select></div><div class="table-wrap"><table><thead><tr><th>BOWLER</th><th>TEAM</th><th>MATCHES</th><th>BALLS</th><th>WICKETS</th><th>ECONOMY</th><th>AVERAGE</th><th>STRIKE RATE</th><th>MAIDENS</th></tr></thead><tbody id="bowlerBody"></tbody></table></div><button class="btn btn-secondary" id="bowlerLoadMore" style="width:100%;margin-top:10px">Load more bowling records</button></div>`}
function predictionPage(){return `<section class="panel model-evaluation"><div class="model-evaluation-head"><div><div class="eyebrow"><i></i> TRANSPARENT MODEL CHECK</div><h2>Model accuracy &amp; backtest</h2><p>Chronological holdout: use the previous two innings to forecast the next recorded innings. “Accuracy” means the share of predictions within 10 runs, not a classification accuracy score.</p></div><div class="model-evaluation-filters"><select id="evalGender" class="select-control"><option value="male">Men</option><option value="female">Women</option></select><select id="evalFormat" class="select-control"><option>ODI</option><option>T20</option><option>Test</option></select></div></div><div id="modelEvalMetrics" class="model-eval-grid"></div><div id="modelEvalNote" class="model-eval-note"></div></section><div class="prediction-layout"><article class="panel prediction-form"><div class="eyebrow"><i></i> RECENT-FORM MODEL</div><h2 style="font:600 18px 'Space Grotesk';margin:8px 0">Next Match Estimate</h2><p style="font-size:10px;color:var(--muted);line-height:1.7">Uses a two-innings rolling average from actual Cricsheet scores. Position and pitch are optional adjustments, not trained features.</p><label>PLAYER</label><select id="predPlayer" class="select-control">${Object.keys(players).sort((a,b)=>a.localeCompare(b)).map(n=>`<option ${n===chosen[0]?'selected':''}>${n}</option>`).join('')}</select><label>FORMAT</label><select id="predFormat" class="select-control"><option>ODI</option><option>T20</option><option>Test</option></select><label>Expected batting position</label><select id="batPos" class="select-control"><option value="1">Opening</option><option value="2">Top order</option><option value="3">Middle order</option><option value="4">Lower order</option></select><label>Match conditions</label><select id="conditions" class="select-control"><option value="1">Neutral conditions</option><option value="1.08">Batting-friendly pitch</option><option value="0.9">Bowling-friendly pitch</option></select><button class="btn btn-primary" id="runPrediction" style="width:100%;margin-top:14px">✦ Generate estimate</button></article><article class="panel prediction-result" id="predictionResult"><div class="result-badge">PROTOTYPE ESTIMATE</div><div class="prediction-score">—</div><h2>Expected Runs</h2><p>Choose a player and format to estimate runs from their two latest recorded innings.</p><span class="model-source-note">Source: Cricsheet · through ${CRICFY_CRICSHEET.meta.dataThrough}</span></article></div>`}
function oppositionVsStats(name, opponentTeam, selectedFormat){
  let innings=recentFor(name,selectedFormat).filter(entry=>entry.opponent&&entry.opponent.toLowerCase()===opponentTeam.toLowerCase());
  let runs=innings.reduce((sum,e)=>sum+e.runs,0);
  let balls=innings.reduce((sum,e)=>sum+e.balls,0);
  let outs=innings.filter(e=>!e.notOut).length;
  return {innings:innings.length,runs,balls,outs,average:outs?runs/outs:null,strikeRate:balls?runs*100/balls:null,high:innings.length?Math.max(...innings.map(e=>e.runs)):null};
}
function matchupsPage(){
  let playerNames=Object.keys(players).sort((a,b)=>a.localeCompare(b));
  if(!matchupSelection){
    matchupSelection=[chosen[0]&&players[chosen[0]]?chosen[0]:(playerNames.includes('KL Rahul')?'KL Rahul':playerNames[0]),chosen[1]&&players[chosen[1]]?chosen[1]:(playerNames.includes('Jasprit Bumrah')?'Jasprit Bumrah':playerNames[1]||playerNames[0])];
  }
  let batter=players[matchupSelection[0]]?matchupSelection[0]:(playerNames.includes('KL Rahul')?'KL Rahul':playerNames[0]);
  let bowler=players[matchupSelection[1]]?matchupSelection[1]:(playerNames.includes('Jasprit Bumrah')?'Jasprit Bumrah':playerNames.find(name=>name!==batter)||batter);
  matchupSelection=[batter,bowler];
  let selectedFormat=['ODI','T20','Test'].includes(matchupFormat)?matchupFormat:'ODI';
  matchupFormat=selectedFormat;
  let bTeam=players[batter]?.team||'',bowlTeam=players[bowler]?.team||'';
  let bs=battingStats(batter,selectedFormat),bb=bowlingStats(bowler,selectedFormat);
  let batterVsBowlTeam=oppositionVsStats(batter,bowlTeam,selectedFormat);
  let bowlVsBatterTeam=oppositionVsStats(bowler,bTeam,selectedFormat);
  let playerOptions=playerNames.map(name=>`<option value='${escapeHtml(name)}' ${name===batter?'selected':''}>${escapeHtml(name)}</option>`).join('');
  let bowlerOptions=playerNames.map(name=>`<option value='${escapeHtml(name)}' ${name===bowler?'selected':''}>${escapeHtml(name)}</option>`).join('');
  return `<section class='panel matchup-panel'><div class='section-heading'><div><h2>Head-to-Head Matchup</h2><p>Compare two players and their recorded performances against each other’s teams.</p></div></div><div class='matchup-selects'><div><label for='matchupBatter'>BATTER</label><select id='matchupBatter' class='select-control'>${playerOptions}</select></div><div><label for='matchupBowler'>BOWLER</label><select id='matchupBowler' class='select-control'>${bowlerOptions}</select></div><div><label for='matchupFormat'>FORMAT</label><select id='matchupFormat' class='select-control'><option value='ODI' ${selectedFormat==='ODI'?'selected':''}>ODI</option><option value='T20' ${selectedFormat==='T20'?'selected':''}>T20</option><option value='Test' ${selectedFormat==='Test'?'selected':''}>Test</option></select></div><div><button class='btn btn-primary' id='matchupGo'>Compare</button></div></div><div class='matchup-compare'><div class='matchup-side'><div class='player-matchup-header'>${imgHtml(batter,'')} <strong>${flagHtml(bTeam)} ${batter}</strong><span class='pill'>${bTeam}</span></div><div class='matchup-stats-grid'><div class='stat-card'><span>Runs</span><strong>${fmt(bs?.runs)}</strong><small>batting matches ${fmt(bs?.matches)}</small></div><div class='stat-card'><span>Average</span><strong>${fmt(bs?.average)}</strong><small>strike rate ${fmt(bs?.strikeRate)}</small></div><div class='stat-card'><span>Highest</span><strong>${fmt(bs?.high)}</strong><small>${fmt(bs?.centuries)} 100s · ${fmt(bs?.fifties)} 50s</small></div><div class='stat-card'><span>vs ${bowlTeam}</span><strong>${fmt(batterVsBowlTeam.runs)}</strong><small>${batterVsBowlTeam.innings} recent innings · ${fmt(batterVsBowlTeam.average||'—')} avg</small></div></div>${recentHtml(batter,selectedFormat)}</div><div class='matchup-side'><div class='player-matchup-header'>${imgHtml(bowler,'')} <strong>${flagHtml(bowlTeam)} ${bowler}</strong><span class='pill'>${bowlTeam}</span></div><div class='matchup-stats-grid'><div class='stat-card'><span>Wickets</span><strong>${fmt(bb?.wickets)}</strong><small>bowling matches ${fmt(bb?.bowlingMatches)}</small></div><div class='stat-card'><span>Economy</span><strong>${fmt(bb?.economy)}</strong><small>bowling avg ${fmt(bb?.bowlingAverage)}</small></div><div class='stat-card'><span>Balls</span><strong>${fmt(bb?.ballsBowled)}</strong><small>maidens ${fmt(bb?.maidens)}</small></div><div class='stat-card'><span>vs ${bTeam}</span><strong>${fmt(bowlVsBatterTeam.runs)} conceded</strong><small>${bowlVsBatterTeam.innings} recent innings · ${fmt(bowlVsBatterTeam.wickets||0)} wkts</small></div></div>${recentHtml(bowler,selectedFormat)}</div></div></section>`;
}function fantasyCredit(name,selectedFormat){
  let bat=battingStats(name,selectedFormat),bowl=bowlingStats(name,selectedFormat),recent=recentFor(name,selectedFormat).reduce((sum,e)=>sum+e.runs,0);
  let score=0;
  if(bat){score+=(bat.runs||0)/400+(bat.average||0)*2+(bat.strikeRate||0)/30+(bat.centuries||0)*3+(bat.fifties||0)*1+recent/50;}
  if(bowl){score+=(bowl.wickets||0)*2+(bowl.bowlingMatches||0)/10+(12-Math.min(12,Math.max(0,bowl.economy||7)))*1.5;}
  return Math.max(6,Math.min(24,Math.round(score*4+6)));
}
function fantasyXIPage(){
  let budget=100,slots=[{role:'Wicketkeeper',count:1},{role:'Batter',count:4},{role:'All-rounder',count:2},{role:'Bowler',count:4}];
  let format=$('fantasyFormat')?.value||'ODI';
  let pool=Object.keys(players).filter(name=>battingStats(name,format)||bowlingStats(name,format)).map(name=>({name,cost:fantasyCredit(name,format),role:players[name].role}));
  let selected=JSON.parse(localStorage.getItem('cricfy-fantasy')||'[]');
  let totalCost=selected.reduce((sum,n)=>{let p=pool.find(x=>x.name===n);return sum+(p?p.cost:0)},0);
  let canAdd=(name)=>{let p=pool.find(x=>x.name===n);return p&&!selected.includes(name)&&totalCost+p.cost<=budget&&selected.length<11;};
  return `<section class="panel fantasy-panel"><div class="section-heading"><div><h2>Fantasy XI Builder</h2><p>Pick 11 players within a ${budget}-credit budget. Credit cost reflects recorded form in the selected format.</p></div></div><div class="fantasy-toolbar"><select id="fantasyFormat" class="select-control"><option ${format==='ODI'?'selected':''}>ODI</option><option ${format==='T20'?'selected':''}>T20</option><option ${format==='Test'?'selected':''}>Test</option></select><span class="fantasy-budget">Budget: <strong>${budget-totalCost}/${budget} credits</strong> · Squad: <strong>${selected.length}/11</strong></span><button class="btn btn-secondary" id="fantasyReset">↻ Reset squad</button></div><div class="fantasy-slots">${slots.map(slot=>`<div class="fantasy-slot"><strong>${slot.role} (${slot.count})</strong><div class="fantasy-picks">${selected.filter(name=>{let p=pool.find(x=>x.name===name);return p&&roleMatches(p.role,slot.role)}).map(name=>`<span class="fantasy-pick">${escapeHtml(name)}<button class="fantasy-remove" data-fantasy-remove="${escapeHtml(name)}">×</button></span>`).join('')}</div></div>`).join('')}</div><div class="fantasy-pool"><h3>Available Players</h3><div class="fantasy-grid">${pool.map(p=>`<article class="fantasy-card ${selected.includes(p.name)?'selected':''}">${imgHtml(p.name,'')}<div class="fantasy-card-body"><div class="fantasy-card-head">${flagHtml(players[p.name].team)} ${escapeHtml(p.name)}<span class="fantasy-cost">💳 ${p.cost}</span></div><p>${escapeHtml(p.role)} · ${players[p.name].team}</p><button class="btn btn-small ${selected.includes(p.name)?'btn-secondary':'btn-primary'} ${!canAdd(p.name)?'disabled':''} data-fantasy-add="${escapeHtml(p.name)}">${selected.includes(p.name)?'Added':(canAdd(p.name)?'＋ Add':'Over budget')}</button></div></article>`).join('')}</div></div><div class="fantasy-points"><h3>Points Simulator (next match)</h3><p>Projected fantasy points based on recent form: +1 per run, +10 per wicket, +5 per catch, +2 for 30-run bonus, +2 for 3-wicket bonus.</p><div class="fantasy-points-grid">${selected.map(name=>{let bat=battingStats(name,format),bowl=bowlingStats(name,format),recent=recentFor(name,format);let projRuns=recent.length?(recent.slice(0,3).reduce((sum,e)=>sum+e.runs,0)/Math.min(3,recent.length)):0;let projWkts=bowl?(bowl.wickets/Math.max(1,bowl.bowlingMatches))*2:0;let points=Math.round(projRuns+projWkts*10);return `<div class="fantasy-point-row">${imgHtml(name,'')}<div><strong>${escapeHtml(name)}</strong><small>${players[name].team}</small></div><span class="proj-runs">~${Math.round(projRuns)} runs</span><span class="proj-wkts">~${projWkts.toFixed(1)} wkts</span><span class="proj-pts"><strong>${points} pts</strong></span></div>`}).join('')||'<p class="muted">No players selected yet.</p>'}</div></div></section>`;
}
function roleMatches(role,slot){
  let r=role||'';
  if(slot==='Wicketkeeper')return /wicketkeeper/i.test(r);
  if(slot==='Batter')return /batter|batsman/i.test(r)&&!/all-rounder/i.test(r)&&!/bowler/i.test(r);
  if(slot==='All-rounder')return /all-rounder/i.test(r);
  if(slot==='Bowler')return /bowler/i.test(r)||!/batter|batsman/i.test(r);
  return true;
}
function gameBowlerNames(team=''){
  return Object.keys(players).filter(name=>/bowler/i.test(players[name]?.role||'')&&(!team||players[name].team===team)).sort((a,b)=>a.localeCompare(b));
}
function gameBatterNames(team=''){
  let names=Object.keys(players).filter(name=>players[name].team===team&&/batter|all-rounder|wicketkeeper/i.test(players[name]?.role||''));
  if(!names.length)names=Object.keys(players).filter(name=>players[name].team===team);
  return names.sort((a,b)=>a.localeCompare(b));
}
function gameOpponentCountries(team){
  return [...new Set(gameBowlerNames().map(name=>players[name].team).filter(country=>country&&country!==team&&gameBatterNames(country).length))].sort((a,b)=>a.localeCompare(b));
}
function suggestedGameBowler(team){
  let bowlers=gameBowlerNames(team);
  return bowlers.find(name=>/fast bowler/i.test(players[name]?.role||''))||bowlers[0]||'';
}
function suggestedGameBatter(team){
  let batters=gameBatterNames(team);
  return batters.find(name=>battingStats(name,'T20')?.matches>=10)||batters[0]||'';
}
function gameSelectOptions(names,selected,withFlags=false){
  return names.map(name=>`<option value="${escapeHtml(name)}" ${name===selected?'selected':''}>${withFlags?`${countryFlag(name)||'🏳️'} `:''}${escapeHtml(name)}</option>`).join('');
}
function updateGameOpponentOptions(){
  let team=$('gameOpponentCountry').value;
  let batters=gameBatterNames(team),bowlers=gameBowlerNames(team);
  let batter=batters.includes($('gameOpponentBatter').value)?$('gameOpponentBatter').value:suggestedGameBatter(team);
  let bowler=bowlers.includes($('gameBowler').value)?$('gameBowler').value:suggestedGameBowler(team);
  $('gameOpponentBatter').innerHTML=gameSelectOptions(batters,batter);
  $('gameBowler').innerHTML=gameSelectOptions(bowlers,bowler);
}
function updateGameHomeOptions(){
  let team=players[$('gamePlayer').value]?.team||'';
  let bowlers=gameBowlerNames(team);
  let userBowler=bowlers.includes($('gameOwnBowler').value)?$('gameOwnBowler').value:suggestedGameBowler(team);
  $('gameOwnBowler').innerHTML=gameSelectOptions(bowlers,userBowler);
  let countries=gameOpponentCountries(team);
  let opponentCountry=countries.includes($('gameOpponentCountry').value)?$('gameOpponentCountry').value:countries.includes('Australia')?'Australia':countries[0]||'';
  $('gameOpponentCountry').innerHTML=gameSelectOptions(countries,opponentCountry,true);
  updateGameOpponentOptions();
}
function gamePage(){
  let selectedPlayer=players[gameState.player]?gameState.player:chosen[0];
  let userTeam=players[selectedPlayer]?.team||'India';
  let ownBowlers=gameBowlerNames(userTeam);
  let selectedUserBowler=ownBowlers.includes(gameState.userBowler)?gameState.userBowler:suggestedGameBowler(userTeam);
  let opponentCountries=gameOpponentCountries(userTeam);
  let selectedCountry=opponentCountries.includes(gameState.opponentCountry)?gameState.opponentCountry:opponentCountries.includes('Australia')?'Australia':opponentCountries[0]||'';
  let opponentBowlers=gameBowlerNames(selectedCountry);
  let opponentBatters=gameBatterNames(selectedCountry);
  let selectedOpponentBatter=opponentBatters.includes(gameState.opponentBatter)?gameState.opponentBatter:suggestedGameBatter(selectedCountry);
  let selectedOpponentBowler=opponentBowlers.includes(gameState.bowler)?gameState.bowler:suggestedGameBowler(selectedCountry);
  Object.assign(gameState,{player:selectedPlayer,userBowler:selectedUserBowler,opponentCountry:selectedCountry,opponentBatter:selectedOpponentBatter,bowler:selectedOpponentBowler});
  if(!gameState.active&&gameState.phase==='ready')gameState.currentBatter=selectedPlayer;
  return `<section class="panel game-intro"><div class="game-intro-copy"><div class="eyebrow"><i></i> CRICFY CPU MATCH</div><h2>Five-over international</h2><p>Pick your XI leaders and face a local AI team from another country. Bat for five overs, then bowl while the bot chases your target.</p><div class="game-mode-badge"><span></span> OFFLINE AI · TWO INNINGS · 5 OVERS EACH</div></div><div class="game-setup">
    <div class="game-select-group"><label for="gamePlayer">YOUR BATTER</label><select id="gamePlayer" class="select-control">${gameSelectOptions(Object.keys(players).sort((a,b)=>a.localeCompare(b)),selectedPlayer)}</select></div>
    <div class="game-select-group"><label for="gameOwnBowler">YOUR BOWLER</label><select id="gameOwnBowler" class="select-control">${gameSelectOptions(ownBowlers,selectedUserBowler)}</select></div>
    <div class="game-select-group"><label for="gameOpponentCountry">OPPONENT COUNTRY</label><select id="gameOpponentCountry" class="select-control">${gameSelectOptions(opponentCountries,selectedCountry,true)}</select></div>
    <div class="game-select-group"><label for="gameOpponentBatter">CPU BATTER</label><select id="gameOpponentBatter" class="select-control">${gameSelectOptions(opponentBatters,selectedOpponentBatter)}</select></div>
    <div class="game-select-group"><label for="gameBowler">CPU BOWLER</label><select id="gameBowler" class="select-control">${gameSelectOptions(opponentBowlers,selectedOpponentBowler)}</select></div>
    <div class="game-setup-actions"><button class="btn btn-primary" id="gameStart">▶ Start match</button><button class="btn btn-secondary" id="gameNew">↻ New match</button></div>
  </div></section>
  <section class="game-arena" aria-label="Five-over cricket match">
    <div class="game-stadium-lights" aria-hidden="true"></div><div class="game-crowd" aria-hidden="true"></div>
    <div class="game-field" aria-hidden="true"><div class="game-boundary"></div><div class="game-pitch"></div><div class="game-stumps"><i></i><i></i><i></i></div></div>
    <div class="game-matchup-bar"><div id="gameHomeTeam">${countryFlag(userTeam)||'🏳️'} ${escapeHtml(userTeam)}</div><strong>VS</strong><div id="gameAwayTeam">${countryFlag(selectedCountry)||'🏳️'} ${escapeHtml(selectedCountry)}</div><span id="gameInningsBadge">1ST INNINGS</span></div>
    <div class="game-field-player game-field-batter"><div id="gameFieldBatterPortrait">${imgHtml(selectedPlayer,'game-field-avatar')}</div><span><small>AT THE CREASE</small><strong id="gameFieldBatterName">${escapeHtml(selectedPlayer)}</strong></span></div>
    <div class="game-field-player game-field-bowler"><div id="gameFieldBowlerPortrait">${imgHtml(selectedOpponentBowler,'game-field-avatar')}</div><span><small>AI BOWLER</small><strong id="gameFieldBowlerName">${escapeHtml(selectedOpponentBowler)}</strong></span></div>
    <div class="game-bowler-chip"><div id="gameBowlerPortrait">${imgHtml(selectedOpponentBowler,'game-bowler-avatar')}</div><div><small id="gameBowlerTag">CPU BOWLER</small><strong id="gameBowlerName">${escapeHtml(selectedOpponentBowler)}</strong><span id="gameBowlerRole">${escapeHtml(players[selectedOpponentBowler]?.role||'Bowler')}</span></div></div>
    <div class="game-ball" id="gameBall" aria-hidden="true"></div>
    <div class="game-arena-caption"><span class="game-live-dot"></span> INTERNATIONAL T20 <span>·</span> 5 OVERS</div>
    <div class="game-live-message" id="gameLiveMessage" aria-live="polite">Choose a side and start the match.</div>
    <div class="game-scoreboard">
      <div class="game-batter-info"><div id="gamePlayerPortrait">${imgHtml(selectedPlayer,'game-player-avatar')}</div><div><small id="gameBatterTag">YOUR BATTER</small><strong id="gamePlayerName">${escapeHtml(selectedPlayer)}</strong><span id="gameTeamTag">${escapeHtml(userTeam)}</span></div></div>
      <div class="game-score"><small>SCORE</small><strong id="gameScore">0/0</strong></div>
      <div class="game-overs"><small>OVERS</small><strong><span id="gameOvers">0.0</span><i> / 5</i></strong></div>
      <div class="game-target"><small>TARGET</small><strong id="gameTarget">—</strong></div>
      <div class="game-run-rate"><small id="gameRateLabel">RUN RATE</small><strong id="gameRunRate">0.00</strong></div>
    </div>
  </section>
  <section class="panel game-controls"><div class="game-controls-heading"><div><h2 id="gameControlTitle">Choose your shot</h2><p id="gameStatus" aria-live="polite">Start the match to begin your innings.</p></div><div class="game-control-actions"><span class="game-how-to" id="gameHowTo">Choose a batting intent; the AI bowler adapts.</span><button class="btn btn-primary hidden" id="gameContinue">▶ Start the chase</button><button class="btn btn-primary hidden" id="gameReplay">↻ Play again</button></div></div><div class="game-shot-grid">${GAME_SHOTS.map(shot=>`<button class="game-shot" data-game-shot="${shot}" disabled><strong>${shot}</strong><span>${GAME_SHOT_LABELS[shot]}</span></button>`).join('')}</div></section>
  <section class="panel game-commentary"><div class="game-controls-heading"><div><h2>Match commentary</h2><p>Ball-by-ball updates for both innings.</p></div></div><ol id="gameBallLog" class="game-ball-log"><li class="game-empty-log">Commentary will appear here when the match starts.</li></ol></section>`
}
function aboutPage(){return `
  <section class="panel about-me">
    <div class="about-me-content">
      <div class="eyebrow">ABOUT THE DEVELOPER</div>
      <h2>Ram Krishna Sarkar</h2>
      <div class="about-role">B.Tech Computer Science &amp; Engineering · Data Analytics</div>
      <p>I am an aspiring data analyst and software developer who enjoys building interactive web experiences and exploring data, AI, and machine learning.</p>
      <a class="btn btn-primary" href="https://404codeerror.github.io/RKSARKAR-portfolio/" target="_blank" rel="noopener noreferrer">Visit my portfolio <span aria-hidden="true">&rarr;</span></a>
    </div>
    <a class="about-linkedin-photo" href="https://www.linkedin.com/in/rksarkar/" target="_blank" rel="noopener noreferrer" aria-label="Visit Ram Krishna Sarkar on LinkedIn">
      <img class="about-me-photo" src="./assets/images/ram-krishna-sarkar.jpeg" alt="Portrait of Ram Krishna Sarkar" width="112" height="112" loading="eager" decoding="async" onerror="this.onerror=null;this.src=getFallback('Ram Krishna Sarkar')">
      <span>in</span>
    </a>
  </section>
  <section class="feedback-support-layout">
    <article class="panel feedback-support-card">
      <div class="eyebrow"><i></i> FEEDBACK</div>
      <h2>Share your feedback</h2>
      <p>Tell us what to improve or what worked well in Cricfy.iq.</p>
      <p class="feedback-delivery-note">Your message will be sent to ramkrishnasarkar820@gmail.com via FormSubmit.</p>
      <form id="feedbackForm" class="feedback-form">
        <div class="feedback-fields">
          <div class="feedback-field">
            <label for="feedbackName">Your name</label>
            <input id="feedbackName" class="select-control" name="name" autocomplete="name" placeholder="Name (optional)">
          </div>
          <div class="feedback-field">
            <label for="feedbackRating">Your rating</label>
            <select id="feedbackRating" class="select-control" name="rating">
              <option value="5">★★★★★ Excellent</option>
              <option value="4">★★★★☆ Good</option>
              <option value="3">★★★☆☆ Average</option>
              <option value="2">★★☆☆☆ Needs improvement</option>
              <option value="1">★☆☆☆☆ Poor</option>
            </select>
          </div>
        </div>
        <div class="feedback-field">
          <label for="feedbackMessage">Your message</label>
          <textarea id="feedbackMessage" name="message" rows="4" required placeholder="What can we improve?"></textarea>
        </div>
        <button class="btn btn-primary feedback-submit" type="submit">Send feedback <span aria-hidden="true">→</span></button>
      </form>
    </article>
    <article class="panel feedback-support-card">
      <div class="eyebrow"><i></i> SUPPORT</div>
      <h2>Contact &amp; connect</h2>
      <p>For project support, suggestions or collaboration, use one of the options below.</p>
      <div class="support-links">
        <a class="support-link" href="tel:+917085391047"><span class="support-icon phone-icon" aria-hidden="true">☎</span><div><small>Call me</small><strong>+91 70853 91047</strong></div><span class="support-arrow" aria-hidden="true">↗</span></a>
        <a class="support-link" href="https://wa.me/917085391047" target="_blank" rel="noopener noreferrer">
          <span class="support-icon whatsapp-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 3.2A12.6 12.6 0 0 0 5.2 22.3L3.5 28.5l6.3-1.6A12.6 12.6 0 1 0 16 3.2Zm0 22.8a10.2 10.2 0 0 1-5.2-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10.2 10.2 0 1 1 16 26Zm5.6-7.6c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.3 3.5 5.5 4.9.8.4 1.4.6 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.5Z"/></svg></span>
          <div><small>WhatsApp</small><strong>Message me directly</strong></div><span class="support-arrow" aria-hidden="true">↗</span>
        </a>
        <a class="support-link" href="https://www.linkedin.com/in/rksarkar/" target="_blank" rel="noopener noreferrer">
          <span class="support-icon linkedin-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5.2 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM3.4 9h3.7v11.6H3.4V9Zm5.9 0h3.5v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.8 0 4.5 2.5 4.5 5.7v6.2h-3.7v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6H9.3V9Z"/></svg></span>
          <div><small>LinkedIn</small><strong>Connect with me</strong></div><span class="support-arrow" aria-hidden="true">↗</span>
        </a>
        <a class="support-link" href="https://www.youtube.com/@Ramkrishna28005" target="_blank" rel="noopener noreferrer">
          <span class="support-icon youtube-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg></span>
          <div><small>YouTube</small><strong>Visit my channel</strong></div><span class="support-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  </section>
  <article class="panel about-banner">
    <div class="eyebrow">ABOUT THE PROJECT</div>
    <h2>Cricfy.iq</h2>
    <p>Player batting statistics are calculated from Cricsheet international Test, ODI, and T20 ball-by-ball records, matched with Cricsheet’s player register (which includes ESPNcricinfo identifiers). This is not a direct ESPNcricinfo data feed. The current snapshot runs through ${CRICFY_CRICSHEET.meta.dataThrough}; matches missing from the source are not included, and unavailable player-format records are shown as —.</p>
    <p>Source: <a href="${CRICFY_CRICSHEET.meta.sourceUrl}" target="_blank" rel="noopener noreferrer">Cricsheet match data</a>, licensed under the <a href="${CRICFY_CRICSHEET.meta.licenseUrl}" target="_blank" rel="noopener noreferrer">Open Data Commons Attribution License 1.0</a>. See the <a href="https://cricsheet.org/licensing/" target="_blank" rel="noopener noreferrer">Cricsheet licensing notes</a>.</p>
  </article>
  <div class="card-grid" style="margin-top:12px">${[['📊','Player Analysis','Explore recorded international batting statistics by format.'],['⚖️','Player Comparison','Compare player records and recent innings across formats.'],['🏟️','Team Analysis','Explore players grouped by national team.'],['📈','Statistics','Browse sourced records and sort or filter by name and format.'],['🔮','Prediction','Illustrative run estimates based on recorded statistics, not match results.'],['🧠','Coverage','Some older or unavailable matches are not represented in the source data.']].map(c=>`<article class="panel feature-card"><div class="big-icon">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p></article>`).join('')}</div>`}
function setHero(page){const map={home:['Cricket <em>Intelligence</em>','Discover player profiles and sourced cricket statistics.'],analysis:['Player <em>Analysis</em>','Explore a player’s recorded performance across formats.'],comparison:['Player <em>Comparison</em>','Compare recorded player stats and recent innings.'],team:['Team <em>Analysis</em>','Explore national teams and available player records.'],stats:['Cricket <em>Statistics</em>','Browse batting and bowling records by player and format.'],directory:['Player <em>Directory</em>','Browse profiles alphabetically and filter by format.'],bestxi:['Best <em>XI Builder</em>','Select from the top four ranked players for each role.'],game:['Play <em>Cricket</em>','Take your favourite cricketer into a five-over batting challenge.'],matches:['Live Scores <em>&amp; Fixtures</em>','Follow current and upcoming Test, ODI and T20 matches.'],prediction:['Performance <em>Prediction</em>','Explore a clearly labeled estimate based on recorded statistics.'],matchups:['Head-to-Head <em>Matchups</em>','Compare two players and their records against each other’s teams.'],fantasy:['Fantasy <em>XI Builder</em>','Build a credit-based fantasy team and simulate points.'],about:['About <em>Cricfy.iq</em>','A student project using sourced international match data.']};$('heroTitle').innerHTML=map[page][0];$('heroSub').textContent=map[page][1]}
function savePlayerForLater(name){if(!name||!players[name])return;if(savedPlayers.includes(name)){toast(`${name} is already saved`);return}savedPlayers.unshift(name);savedPlayers=savedPlayers.slice(0,100);localStorage.setItem('cricfy-saved-players',JSON.stringify(savedPlayers));toast(`${name} saved to your players`)}
function saveCurrentComparison(){let entry={players:[...chosen],format,savedAt:new Date().toISOString()};if(savedComparisons.some(item=>item.format===format&&item.players.join('|')===chosen.join('|'))){toast('This comparison is already saved');return}savedComparisons.unshift(entry);savedComparisons=savedComparisons.slice(0,30);localStorage.setItem('cricfy-saved-comparisons',JSON.stringify(savedComparisons));toast('Comparison saved')}
function savedShelfHtml(){return `<section class="panel saved-shelf"><div class="panel-head"><div><h2>Saved players &amp; comparisons</h2><p>Stored on this device for your next visit.</p></div></div><div class="saved-shelf-grid"><div><h3>Players</h3>${savedPlayers.length?savedPlayers.map(name=>`<div class="saved-row"><button type="button" data-open-saved-player="${escapeHtml(name)}">${countryFlag(players[name]?.team)||''} ${escapeHtml(name)}</button><button type="button" class="saved-remove" data-remove-saved-player="${escapeHtml(name)}" aria-label="Remove ${escapeHtml(name)}">×</button></div>`).join(''):'<p class="saved-empty">Save a player from their analysis profile.</p>'}</div><div><h3>Comparisons</h3>${savedComparisons.length?savedComparisons.map((item,index)=>`<div class="saved-row"><button type="button" data-open-saved-comparison="${index}">${escapeHtml(item.players.join(' vs '))} <small>${escapeHtml(item.format)}</small></button><button type="button" class="saved-remove" data-remove-saved-comparison="${index}" aria-label="Remove saved comparison">×</button></div>`).join(''):'<p class="saved-empty">Save a comparison from the comparison page.</p>'}</div></div></section>`}
const homePageBase=homePage;
homePage=function(){return `${homePageBase()}${savedShelfHtml()}`};
function navigate(page){if(activePage==='game'&&page!=='game')stopRealtimeGameLoop();if(matchesRefreshTimer&&followedTeams.length===0&&followedMatches.length===0&&page!=='matches'){clearInterval(matchesRefreshTimer);matchesRefreshTimer=null}activePage=page;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));setHero(page);Object.keys({home:1,analysis:1,comparison:1,team:1,stats:1,directory:1,bestxi:1,game:1,matches:1,prediction:1,matchups:1,fantasy:1,about:1}).forEach(p=>{let id='page'+p[0].toUpperCase()+p.slice(1);if($(id))$(id).classList.toggle('hidden',p!==page)});renderPage(page);$('navLinks').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'})}
function renderPage(page){
  let id='page'+page[0].toUpperCase()+page.slice(1);
  $(id).innerHTML=({home:homePage,analysis:analysisPage,comparison:comparisonPage,team:teamPage,stats:statsPage,directory:directoryPage,bestxi:bestXIPage,game:gamePage,matches:matchesPage,prediction:predictionPage,matchups:matchupsPage,fantasy:fantasyXIPage,about:aboutPage}[page])();
  if(page==='comparison'){bindComparison();renderComparisonCharts();refreshPhotos(chosen)}
  if(page==='comparison'){
    let toolbar=$('pageComparison').querySelector('.players-panel .toolbar');
    if(toolbar&&!$('saveComparison')){let button=document.createElement('button');button.id='saveComparison';button.className='btn btn-secondary';button.type='button';button.textContent='☆ Save comparison';button.onclick=saveCurrentComparison;toolbar.append(button)}
  }
  if(page==='home'){refreshPhotos(Object.keys(players).slice(0,9));document.querySelectorAll('[data-open-player]').forEach(x=>x.onclick=()=>{if(!chosen.includes(x.dataset.openPlayer)){chosen.unshift(x.dataset.openPlayer);chosen=chosen.slice(0,4)}navigate('analysis');$('analysisPlayer').value=x.dataset.openPlayer;loadAnalysis()});$('homeAdd').onclick=openPlayerModal}
  if(page==='home'){
    document.querySelectorAll('[data-open-saved-player]').forEach(button=>button.onclick=()=>{navigate('analysis');$('analysisPlayer').value=button.dataset.openSavedPlayer;loadAnalysis()});
    document.querySelectorAll('[data-remove-saved-player]').forEach(button=>button.onclick=()=>{savedPlayers=savedPlayers.filter(name=>name!==button.dataset.removeSavedPlayer);localStorage.setItem('cricfy-saved-players',JSON.stringify(savedPlayers));renderPage('home')});
    document.querySelectorAll('[data-open-saved-comparison]').forEach(button=>button.onclick=()=>{let item=savedComparisons[Number(button.dataset.openSavedComparison)];if(!item)return;chosen=item.players.filter(name=>players[name]).slice(0,6);format=item.format||'ODI';renderPage('comparison');syncComparisonUrl()});
    document.querySelectorAll('[data-remove-saved-comparison]').forEach(button=>button.onclick=()=>{savedComparisons.splice(Number(button.dataset.removeSavedComparison),1);localStorage.setItem('cricfy-saved-comparisons',JSON.stringify(savedComparisons));renderPage('home')});
  }
  if(page==='analysis'){$('loadAnalysis').onclick=loadAnalysis;$('exportAnalysisPdf').onclick=()=>exportPlayerPdf($('analysisPlayer').value,$('analysisFormat').value);$('analysisFormat').onchange=e=>{format=e.target.value;loadAnalysis()};$('analysisPlayer').onchange=loadAnalysis;$('analyzeAdd').onclick=()=>openPlayerModal('analysis');loadAnalysis();$('timelineFormat').onchange=e=>renderAnalysisTimeline($('analysisPlayer').value,e.target.value);['analysisOpponent','analysisVenue','analysisYear','analysisInnings'].forEach(id=>$(id).onchange=()=>renderAnalysisContext($('analysisPlayer').value,$('analysisFormat').value))}
  if(page==='analysis'){
    let header=$('pageAnalysis').querySelector('.panel-analysis-context .panel-head');
    if(header){let refresh=document.createElement('button');refresh.className='btn btn-small btn-secondary';refresh.type='button';refresh.textContent='Refresh source data';refresh.onclick=()=>refreshLiveData(refresh);header.append(refresh)}
  }
  if(page==='team'){renderTeam();$('teamSelect').onchange=renderTeam}
  if(page==='stats'){
    statsVisible=100;
    bowlerVisible=100;
    renderStats();
    renderBowlers();
    $('statsFilter').oninput=()=>{statsVisible=100;renderStats()};
    $('statsFormat').onchange=()=>{
      statsVisible=100;
      $('bowlerFormat').value=$('statsFormat').value;
      bowlerVisible=100;
      renderStats();
      renderBowlers();
    };
    $('statsSort').onchange=()=>{statsVisible=100;renderStats()};
    $('statsOpposition').onchange=()=>{statsVisible=100;renderStats()};
    $('statsLoadMore').onclick=()=>{statsVisible+=100;renderStats()};
    $('statsExport').onclick=()=>exportCsv(Object.keys(players),$('statsFormat').value);
    $('statsRefresh').onclick=e=>refreshLiveData(e.currentTarget);
    $('bowlerFilter').oninput=()=>{bowlerVisible=100;renderBowlers()};
    $('bowlerFormat').onchange=()=>{bowlerVisible=100;renderBowlers()};
    $('bowlerLoadMore').onclick=()=>{bowlerVisible+=100;renderBowlers()};
  }
  if(page==='bestxi'){
    $('buildXI').onclick=buildXI;
    $('xiFormat').onchange=()=>{updateXiTeamOptions();buildXI()};
    $('xiTeam').onchange=buildXI;
    $('xiGender').onchange=()=>{updateXiTeamOptions();buildXI()};
  }
  if(page==='game'){
    if(!$('gameResultPop')){let pop=document.createElement('div');pop.id='gameResultPop';pop.className='game-result-pop';pop.setAttribute('aria-live','polite');$('pageGame').querySelector('.game-arena').append(pop)}
    if(!$('gameMoveControls')){$('pageGame').querySelector('.game-shot-grid').insertAdjacentHTML('beforebegin','<div class="game-move-controls" id="gameMoveControls"><div class="game-move-copy"><strong>Live play</strong><small>Tap a shot to play · A/D move · W/S step · Space swing manually · R run</small></div><div class="game-move-buttons"><button type="button" id="gameMoveLeft" aria-label="Move batter left">←</button><button type="button" id="gameStepBack" aria-label="Step back">Back</button><button type="button" id="gameRunToggle" aria-pressed="false">Run between wickets</button><button type="button" id="gameStepForward" aria-label="Step forward">Step</button><button type="button" id="gameMoveRight" aria-label="Move batter right">→</button><button type="button" id="gameActionButton">Swing now</button></div></div>')}
    $('gameMoveLeft').onclick=()=>moveGameBatter(-3);
    $('gameMoveRight').onclick=()=>moveGameBatter(3);
    $('gameStepBack').onclick=()=>stepGameBatter(-1);
    $('gameStepForward').onclick=()=>stepGameBatter(1);
    $('gameRunToggle').onclick=toggleGameRunIntent;
    $('gameActionButton').onclick=advanceGameBall;
    $('gamePlayer').onchange=()=>{updateGameHomeOptions();resetCricketGame()};
    $('gameOwnBowler').onchange=resetCricketGame;
    $('gameOpponentCountry').onchange=()=>{updateGameOpponentOptions();resetCricketGame()};
    $('gameOpponentBatter').onchange=resetCricketGame;
    $('gameBowler').onchange=resetCricketGame;
    $('gameStart').onclick=startCricketGame;
    $('gameNew').onclick=resetCricketGame;
    $('gameContinue').onclick=startCpuInnings;
    $('gameReplay').onclick=startCricketGame;
    document.querySelectorAll('[data-game-shot]').forEach(button=>button.onclick=()=>{let intent=Number(button.dataset.gameShot);if(gameState.innings===1)playGameShot(intent);else selectGameIntent(intent)});
    renderGameState();
    refreshPhotos([gameState.player,gameState.currentBatter,gameState.userBowler,gameState.opponentBatter,gameState.bowler]);
    if(gameState.active)startRealtimeGameLoop();
  }
  if(page==='matches'){
    $('refreshMatches').onclick=()=>loadLiveMatches();
    $('matchesFormat').onchange=renderLiveMatches;
    $('matchesState').onchange=renderLiveMatches;
    $('pageMatches').querySelector('.matches-toolbar').insertAdjacentHTML('beforeend','<div class="match-follow-controls"><select id="followTeamSelect" class="select-control" aria-label="Choose a team to follow"><option value="">Choose a team to follow</option></select><button class="btn btn-secondary" id="followTeamBtn" type="button">Follow team</button><button class="btn btn-secondary" id="matchNotificationBtn" type="button">Enable notifications</button><small id="matchFollowSummary"></small></div>');
    $('followTeamBtn').onclick=()=>{let team=$('followTeamSelect').value;if(team)toggleFollowTeam(team);else toast('Select a team first')};
    $('matchNotificationBtn').onclick=enableMatchNotifications;
    $('followTeamSelect').onchange=renderMatchFollowControls;
    renderMatchFollowControls();
    loadLiveMatches();
    if(!matchesRefreshTimer)matchesRefreshTimer=setInterval(()=>{if(document.visibilityState==='visible'&&(activePage==='matches'||followedTeams.length||followedMatches.length))loadLiveMatches()},120000);
  }
  if(page==='directory'){
    $('refreshDirectory').onclick=loadCricsheetDirectory;
    $('refreshLiveData').onclick=e=>refreshLiveData(e.currentTarget);
    $('directorySearch').oninput=()=>{directoryVisible=48;renderDirectory()};
    $('directoryCountry').onchange=()=>{directoryVisible=48;renderDirectory()};
    $('directoryGender').onchange=()=>{directoryVisible=48;updateDirectoryCountryOptions();renderDirectory()};
    $('directoryRecency').onchange=()=>{directoryVisible=48;updateDirectoryCountryOptions();renderDirectory()};
    $('directoryFormat').onchange=()=>{directoryVisible=48;updateDirectoryCountryOptions();renderDirectory()};
    $('directorySort').onchange=()=>{directoryVisible=48;renderDirectory()};
    $('directoryLoadMore').onclick=()=>{directoryVisible+=48;renderDirectory()};
    if(directoryLoaded)renderDirectory();
    else if(!directoryLoading)loadCricsheetDirectory();
  }
  if(page==='prediction'){$('runPrediction').onclick=runPrediction;$('evalGender').onchange=renderModelEvaluation;$('evalFormat').onchange=renderModelEvaluation;renderModelEvaluation()}
  if(page==='matchups'){
    $('matchupGo').onclick=()=>{
      let b=$('matchupBatter').value,w=$('matchupBowler').value;
      if(b===w){toast('Choose two different players');return}
      matchupSelection=[b,w];
      matchupFormat=$('matchupFormat').value;
      renderPage('matchups');
    };
    refreshPhotos([$('matchupBatter')?.value,$('matchupBowler')?.value].filter(Boolean));
  }
  if(page==='fantasy'){
    let saveFantasy=()=>{localStorage.setItem('cricfy-fantasy',JSON.stringify(selectedFantasy))};
    let selectedFantasy=JSON.parse(localStorage.getItem('cricfy-fantasy')||'[]');
    $('fantasyFormat').onchange=()=>{renderPage('fantasy')};
    $('fantasyReset').onclick=()=>{selectedFantasy=[];saveFantasy();renderPage('fantasy')};
    document.querySelectorAll('[data-fantasy-add]').forEach(btn=>btn.onclick=()=>{let name=btn.dataset.fantasyAdd;if(!selectedFantasy.includes(name))selectedFantasy.push(name);saveFantasy();renderPage('fantasy')});
    document.querySelectorAll('[data-fantasy-remove]').forEach(btn=>btn.onclick=()=>{let name=btn.dataset.fantasyRemove;selectedFantasy=selectedFantasy.filter(n=>n!==name);saveFantasy();renderPage('fantasy')});
  }
  if(page==='about'){
    $('feedbackForm').onsubmit=e=>{
      e.preventDefault();
      let form=e.currentTarget,button=form.querySelector('button[type="submit"]');
      let feedback={
        name:$('feedbackName').value.trim(),
        rating:$('feedbackRating').value,
        message:$('feedbackMessage').value.trim(),
        _subject:'New Cricfy.iq feedback',
        _submittedAt:new Date().toISOString()
      };
      button.disabled=true;
      button.textContent='Sending feedback...';
      fetch('https://formsubmit.co/ajax/ramkrishnasarkar820@gmail.com',{
        method:'POST',
        headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify(feedback)
      }).then(async response=>{
        let result=await response.json();
        if(!result||!response.ok||result.success===false||result.success==='false')throw new Error(result?.message||'The feedback service could not accept your message.');
        form.reset();
        toast('Feedback sent. Thank you!');
      }).catch(error=>{
        console.error('Feedback submission failed.',error);
        toast(error.message||'Unable to send feedback. Please try again.');
      }).finally(()=>{
        button.disabled=false;
        button.innerHTML='Send feedback <span aria-hidden="true">→</span>';
      });
    };
  }
}
function bindComparison(){ $('addPlayer').onclick=openPlayerModal;$('compareNow').onclick=()=>{renderComparisonCharts();syncComparisonUrl();toast('Comparison refreshed')};$('resetPlayers').onclick=()=>{chosen=['KL Rahul','Abhishek Sharma','Hardik Pandya','Rishabh Pant'];format='ODI';renderPage('comparison');syncComparisonUrl()};$('copyComparisonLink').onclick=()=>{navigator.clipboard.writeText(buildComparisonUrl()).then(()=>toast('Comparison link copied')).catch(()=>toast('Unable to copy link'))};$('exportComparisonPdf').onclick=()=>{chosen.slice(0,3).forEach((name,index)=>{setTimeout(()=>exportPlayerPdf(name,format),index*900)});toast('Exporting player reports...')};$('formatSelect').onchange=e=>{format=e.target.value;renderPage('comparison');syncComparisonUrl()};document.querySelectorAll('[data-format-person]').forEach(sel=>sel.onchange=e=>{format=e.target.value;$('formatSelect').value=format;renderPage('comparison');syncComparisonUrl()});document.querySelectorAll('[data-remove]').forEach(btn=>btn.onclick=()=>{if(chosen.length<=2){toast('Keep at least two players to compare');return}chosen=chosen.filter(n=>n!==btn.dataset.remove);renderPage('comparison');syncComparisonUrl()});document.querySelectorAll('[data-trend]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-trend]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');updateTrend(btn.dataset.trend)});$('exportCsv').onclick=()=>exportCsv(chosen,format)}
function destroyChart(key){if(charts[key]){charts[key].destroy();delete charts[key]}}
function baseOpts(){return{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9eb5d0',font:{size:9},boxWidth:8,boxHeight:8}}},scales:{x:{ticks:{color:'#90a7c3',font:{size:9}},grid:{color:'#1b2c40'}},y:{ticks:{color:'#90a7c3',font:{size:9}},grid:{color:'#1b2c40'}}}}}
function renderComparisonCharts(){
  if(!$('metricsChart'))return;
  let metricDefinitions=[{label:'Matches',key:0},{label:'Runs ÷ 100',key:1},{label:'Average',key:2},{label:'Strike Rate',key:3},{label:'Highest Score',key:4}];
  let datasets=metricDefinitions.map((metric,index)=>({
    label:metric.label,
    data:chosen.map(name=>{let value=sOf(name)[metric.key];return value===null?null:metric.key===1?value/100:value}),
    backgroundColor:colors[index],
    borderRadius:4
  }));
  destroyChart('metrics');
  charts.metrics=new Chart($('metricsChart'),{type:'bar',data:{labels:chosen,datasets},options:{...baseOpts(),plugins:{legend:{position:'bottom',labels:{color:'#9eb5d0',font:{size:8},boxWidth:8}}},scales:{x:{ticks:{color:'#b6c8dd',font:{size:8}},grid:{display:false}},y:{ticks:{color:'#8da5c0'},grid:{color:'#1b2c40'}}}}});
  drawTrend('runs');
  let scatter=chosen.map((name,index)=>{
    let stats=battingStats(name);
    return{label:name,data:stats?[{x:stats.strikeRate,y:stats.runs}]:[],backgroundColor:colors[index]};
  });
  destroyChart('scatter');
  charts.scatter=new Chart($('scatterChart'),{type:'scatter',data:{datasets:scatter},options:{...baseOpts(),scales:{x:{title:{display:true,text:'Strike Rate',color:'#91a8c4'},ticks:{color:'#91a8c4'},grid:{color:'#1b2c40'}},y:{title:{display:true,text:'Runs in source matches',color:'#91a8c4'},ticks:{color:'#91a8c4'},grid:{color:'#1b2c40'}}}}});
  let metricKeys=[1,2,3,0,5],maxima=metricKeys.map(key=>Math.max(0,...chosen.map(name=>sOf(name)[key]??0)));
  let radar=chosen.map((name,index)=>{
    let stats=sOf(name),data=metricKeys.map((key,metricIndex)=>stats[key]===null||maxima[metricIndex]===0?null:stats[key]/maxima[metricIndex]*100);
    return{label:name,data,borderColor:colors[index],backgroundColor:colors[index]+'25',pointBackgroundColor:colors[index]};
  });
  destroyChart('radar');
  charts.radar=new Chart($('radarChart'),{type:'radar',data:{labels:['Runs','Average','Strike Rate','Matches','100s'],datasets:radar},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{color:'#9eb5d0',font:{size:8},boxWidth:8}}},scales:{r:{min:0,max:100,grid:{color:'#23384e'},angleLines:{color:'#23384e'},pointLabels:{color:'#9fb6d0',font:{size:9}},ticks:{display:false}}}}});
}
function trendData(name,kind){
  let innings=[...recentFor(name)].reverse(),values=innings.map((entry,index)=>{
    if(kind==='runs')return entry.runs;
    if(kind==='strike')return entry.balls?entry.runs*100/entry.balls:null;
    return innings.slice(0,index+1).reduce((total,score)=>total+score.runs,0)/(index+1);
  });
  return [...Array(Math.max(0,5-values.length)).fill(null),...values];
}
function drawTrend(kind){
  if(!$('trendChart'))return;
  destroyChart('trend');
  charts.trend=new Chart($('trendChart'),{type:'line',data:{labels:['5 innings ago','4 innings ago','3 innings ago','2 innings ago','Most recent'],datasets:chosen.map((name,index)=>({label:name,data:trendData(name,kind),borderColor:colors[index],backgroundColor:colors[index],tension:.25,pointRadius:2.5,borderWidth:2}))},options:{...baseOpts(),plugins:{legend:{position:'bottom',labels:{color:'#9eb5d0',font:{size:8},boxWidth:7}}}}});
}
function updateTrend(kind){drawTrend(kind)}
const playerBioCache=new Map();
async function fetchPlayerBio(name){
  if(playerBioCache.has(name))return playerBioCache.get(name);
  let wiki=players[name]?.wiki||name;
  let titles=[wiki,`${name} (cricketer)`,name];
  let url=`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&exsentences=3&titles=${encodeURIComponent(titles.join('|'))}&redirects=1&origin=*`;
  try{
    let response=await fetch(url);
    let data=await response.json();
    let page=Object.values(data.query?.pages||{}).find(p=>p&&!p.missing&&p.extract);
    let bio=page?page.extract.slice(0,400):'';
    playerBioCache.set(name,bio);
    return bio;
  }catch{playerBioCache.set(name,'');return ''}
}
function analysisPage(){return `<div class="analysis-layout"><aside class="panel analysis-select-panel"><h2 style="font:600 14px 'Space Grotesk'">Player Profile</h2><p style="font-size:10px;color:var(--muted)">Select a player, format, and match context.</p><label>PLAYER</label><select id="analysisPlayer" class="select-control">${Object.keys(players).map(n=>`<option ${n===chosen[0]?'selected':''}>${escapeHtml(n)}</option>`).join('')}</select><label>FORMAT</label><select id="analysisFormat" class="select-control"><option ${format==='ODI'?'selected':''}>ODI</option><option ${format==='T20'?'selected':''}>T20</option><option ${format==='Test'?'selected':''}>Test</option></select><div class="analysis-context-filters"><label>OPPONENT</label><select id="analysisOpponent" class="select-control"><option value="">All opponents</option></select><label>VENUE</label><select id="analysisVenue" class="select-control"><option value="">All venues</option></select><label>YEAR</label><select id="analysisYear" class="select-control"><option value="">All years</option></select><label>INNINGS</label><select id="analysisInnings" class="select-control"><option value="">All innings</option><option value="1">1st innings</option><option value="2">2nd innings</option><option value="3">3rd innings</option><option value="4">4th innings</option></select></div><button class="btn btn-primary" style="width:100%;margin-top:14px" id="loadAnalysis">View analysis</button><button class="btn btn-secondary" style="width:100%;margin-top:8px" id="exportAnalysisPdf">⇩ Export PDF</button><button class="btn btn-secondary" style="width:100%;margin-top:8px" id="analyzeAdd">Add another player to compare</button></aside><div class="analysis-main"><article class="panel profile-card" id="analysisProfile"></article><div class="profile-stat-row" id="analysisMiniStats"></div><article class="panel panel-analysis-context"><div class="panel-head"><div><h2>Match context</h2><p id="analysisContextNote">Opponent, venue, year, and innings breakdown</p></div></div><div id="analysisContext"></div></article><article class="panel analysis-chart"><div class="panel-head"><div><h2>Performance Overview</h2><p>Player stats for selected format</p></div></div><div class="chart-box"><canvas id="analysisChart"></canvas></div></article><article class="panel analysis-timeline"><div class="panel-head"><div><h2>Career Timeline</h2><p>Runs scored per season from recorded innings</p></div><div class="timeline-controls"><select id="timelineFormat" class="select-control"><option>ODI</option><option>T20</option><option>Test</option></select><button class="btn btn-secondary btn-small" id="exportTimelinePng">⇩ Save chart</button></div></div><div class="chart-box"><canvas id="timelineChart"></canvas></div></article></div></div>`}
async function loadAnalysis(){
  let name=$('analysisPlayer').value;
  format=$('analysisFormat').value;
  let s=sOf(name),recent=recentFor(name),recentHigh=recent.length?Math.max(...recent.map(innings=>innings.runs)):null;
  let bio=await fetchPlayerBio(name);
  let bioHtml=bio?`<p style="margin-top:8px;font-size:10px;color:var(--muted);line-height:1.5">${escapeHtml(bio)}</p>`:'';
  $('analysisProfile').innerHTML=`${imgHtml(name,'')}<div><h2>${name}</h2><p>${flagHtml(players[name].team)} ${players[name].team} · ${players[name].role}</p><span class="pill">${format} FORMAT</span><p style="margin-top:8px">International match records from Cricsheet through ${CRICFY_CRICSHEET.meta.dataThrough}.</p>${bioHtml}<p style="margin-bottom:3px">Recent batting innings</p>${recentHtml(name)}</div>`;
  $('analysisMiniStats').innerHTML=[['Matches',s[0]],['Runs',fmt(s[1])],['Average',fmt(s[2])],['Strike Rate',fmt(s[3])],['Recent high',fmt(recentHigh)]].map(x=>`<div class="panel mini-stat"><label>${x[0]}</label><strong>${x[1]}</strong></div>`).join('');
  destroyChart('analysis');
  charts.analysis=new Chart($('analysisChart'),{type:'bar',data:{labels:['Runs','Average','Strike Rate','Highest Score','100s','50s'],datasets:[{label:name,data:[s[1]===null?null:s[1]/100,s[2],s[3],s[4],s[5]===null?null:s[5]*10,s[6]],backgroundColor:['#438cff','#47d38a','#ffad53','#9d72ff','#f2668d','#38cfe3'],borderRadius:4}]},options:{...baseOpts(),plugins:{legend:{display:false}}}});
  renderAnalysisTimeline(name,format);
  refreshPhotos([name]);
}
function renderAnalysisTimeline(name,selectedFormat){
  if(!$('timelineChart'))return;
  let innings=[...(recentFor(name,selectedFormat))].reverse();
  let byYear={};
  innings.forEach(entry=>{
    let year=entry.date?entry.date.slice(0,4):'';
    if(!year)return;
    if(!byYear[year])byYear[year]={runs:0,balls:0,innings:0};
    byYear[year].runs+=entry.runs||0;
    byYear[year].balls+=entry.balls||0;
    byYear[year].innings+=1;
  });
  let years=Object.keys(byYear).sort();
  destroyChart('timeline');
  charts.timeline=new Chart($('timelineChart'),{type:'bar',data:{labels:years,datasets:[{label:'Runs',data:years.map(y=>byYear[y].runs),backgroundColor:'#4a9eff'},{label:'Innings',data:years.map(y=>byYear[y].innings),backgroundColor:'#4ed7df'}]},options:{...baseOpts(),plugins:{legend:{position:'bottom',labels:{color:'#9eb5d0',font:{size:8}}},title:{display:true,text:'Runs and innings by season',color:'#9eb5d0',font:{size:10}}},scales:{x:{ticks:{color:'#90a7c3',font:{size:8}},grid:{color:'#1b2c40'}},y:{ticks:{color:'#90a7c3',font:{size:8}},grid:{color:'#1b2c40'},beginAtZero:true}}}});
}
function analysisContextOptions(selectId,values,placeholder,selectedValue){
  let select=$(selectId);if(!select)return;
  let unique=[...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  select.innerHTML=`<option value="">${placeholder}</option>`+unique.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  if(unique.includes(selectedValue))select.value=selectedValue;
}
function renderAnalysisContext(name,selectedFormat){
  if(!$('analysisContext'))return;
  let stats=battingStats(name,selectedFormat),entries=stats?.inningsLog?.length?stats.inningsLog:(stats?.recent||[]);
  let selected={opponent:$('analysisOpponent').value,venue:$('analysisVenue').value,year:$('analysisYear').value,innings:$('analysisInnings').value};
  analysisContextOptions('analysisOpponent',entries.map(row=>row.opponent),'All opponents',selected.opponent);
  analysisContextOptions('analysisVenue',entries.map(row=>row.venue),'All venues',selected.venue);
  analysisContextOptions('analysisYear',entries.map(row=>row.date?.slice(0,4)),'All years',selected.year);
  let filtered=entries.filter(row=>(!$('analysisOpponent').value||row.opponent===$('analysisOpponent').value)&&(!$('analysisVenue').value||row.venue===$('analysisVenue').value)&&(!$('analysisYear').value||row.date?.startsWith($('analysisYear').value))&&(!$('analysisInnings').value||String(row.innings)===$('analysisInnings').value));
  let runs=filtered.reduce((sum,row)=>sum+(row.runs||0),0),balls=filtered.reduce((sum,row)=>sum+(row.balls||0),0),outs=filtered.filter(row=>!row.notOut).length;
  let average=outs?` ${(runs/outs).toFixed(2)}`:'—',strike=balls?(runs*100/balls).toFixed(2):'—',high=filtered.length?Math.max(...filtered.map(row=>row.runs||0)):'—';
  let hasFullLog=Boolean(stats?.inningsLog?.length);
  $('analysisContextNote').textContent=hasFullLog?`${filtered.length.toLocaleString()} innings match the selected filters`:`Showing the ${filtered.length} most recent available innings; full venue history appears after the Cricsheet snapshot refreshes.`;
  $('analysisContext').innerHTML=`<div class="context-stat-grid"><div><small>INNINGS</small><strong>${filtered.length}</strong></div><div><small>RUNS</small><strong>${runs.toLocaleString()}</strong></div><div><small>AVERAGE</small><strong>${average.trim()}</strong></div><div><small>STRIKE RATE</small><strong>${strike}</strong></div><div><small>HIGH SCORE</small><strong>${high}</strong></div></div>${filtered.length?`<div class="table-wrap context-innings-table"><table><thead><tr><th>DATE</th><th>OPPONENT</th><th>VENUE</th><th>INNINGS</th><th>SCORE</th><th>BALLS</th></tr></thead><tbody>${filtered.slice(0,12).map(row=>`<tr><td>${escapeHtml(row.date||'—')}</td><td>${escapeHtml(row.opponent||'—')}</td><td>${escapeHtml(row.venue||'—')}</td><td>${row.innings||'—'}</td><td>${row.runs??'—'}${row.notOut?'*':''}</td><td>${row.balls??'—'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty-context">No innings match these filters.</p>'}`;
}
const loadAnalysisWithContext=loadAnalysis;
loadAnalysis=async function(){await loadAnalysisWithContext();let name=$('analysisPlayer').value;renderAnalysisContext(name,$('analysisFormat').value);$('analysisProfile').querySelector('.save-profile-action')?.remove();let button=document.createElement('button');button.className='btn btn-secondary btn-small save-profile-action';button.type='button';button.textContent=savedPlayers.includes(name)?'✓ Saved':'☆ Save player';button.onclick=()=>{savePlayerForLater(name);button.textContent='✓ Saved'};$('analysisProfile').querySelector('div')?.append(button)};
function renderTeam(){
  let team=$('teamSelect').value,list=Object.keys(players).filter(name=>players[name].team===team);
  $('teamContent').innerHTML=list.length?`<div class="team-cards">${list.map(name=>{let s=sOf(name);return `<article class="panel team-card"><div class="team-logo">${imgHtml(name,'')}</div><h3>${flagHtml(players[name].team)} ${name}</h3><p>${players[name].role}</p><p><b>${fmt(s[1])}</b> Runs · <b>${fmt(s[2])}</b> Avg</p>${recentHtml(name)}<button class="btn btn-secondary btn-small" data-team-player="${name}" style="margin-top:9px">Open analysis</button></article>`}).join('')}</div>`:`<div class="panel feature-card"><h3>No player profiles for this team are listed yet.</h3><p>Use Add Player and search for a player to add them to your comparison list.</p><button class="btn btn-primary" id="teamAdd">＋ Add player</button></div>`;
  refreshPhotos(list.slice(0,100));
  document.querySelectorAll('[data-team-player]').forEach(button=>button.onclick=()=>{navigate('analysis');$('analysisPlayer').value=button.dataset.teamPlayer;loadAnalysis()});
  if($('teamAdd'))$('teamAdd').onclick=openPlayerModal;
}
function renderStats(){
  let selectedFormat=$('statsFormat').value,query=$('statsFilter').value.toLowerCase(),sort=$('statsSort').value,opposition=$('statsOpposition')?.value||'';
  format=selectedFormat;
  let allTeams=[...new Set(Object.values(CRICFY_CRICSHEET.players).map(record=>record.team).filter(Boolean))].sort();
  let oppSelect=$('statsOpposition');
  if(oppSelect&&oppSelect.options.length===1){
    oppSelect.innerHTML='<option value="">All opposition</option>'+allTeams.map(team=>`<option value="${escapeHtml(team)}">${countryFlag(team)} ${escapeHtml(team)}</option>`).join('');
    if(opposition&&allTeams.includes(opposition))oppSelect.value=opposition;
  }
  let names=Object.keys(players).filter(name=>{
    if(!name.toLowerCase().includes(query)||!battingStats(name,selectedFormat))return false;
    if(opposition){
      let innings=recentFor(name,selectedFormat);
      return innings.some(entry=>entry.opponent&&entry.opponent.toLowerCase()===opposition.toLowerCase());
    }
    return true;
  });
  let sortKeys={runs:'runs',avg:'average',strike:'strikeRate',matches:'matches'};
  if(sort==='name')names.sort((first,second)=>first.localeCompare(second));
  else names.sort((first,second)=>(battingStats(second,selectedFormat)?.[sortKeys[sort]]??-1)-(battingStats(first,selectedFormat)?.[sortKeys[sort]]??-1));
  let visibleNames=names.slice(0,statsVisible);
  $('statsBody').innerHTML=visibleNames.map(name=>{
    let stats=battingStats(name,selectedFormat);
    return `<tr><td><div class="table-name">${imgHtml(name,'')} ${name}</div></td><td>${flagHtml(players[name].team)} ${players[name].team}</td><td>${fmt(stats?.matches)}</td><td>${fmt(stats?.runs)}</td><td>${fmt(stats?.average)}</td><td>${fmt(stats?.strikeRate)}</td><td>${fmt(stats?.high)}</td><td>${recentHtml(name,selectedFormat)}</td></tr>`;
  }).join('')||'<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:24px">No batting records match this filter.</td></tr>';
  $('statsLoadMore').classList.toggle('hidden',visibleNames.length>=names.length);
  refreshPhotos(visibleNames);
}
function renderBowlers(){
  let selectedFormat=$('bowlerFormat').value;
  let query=$('bowlerFilter').value.toLowerCase();
  format=selectedFormat;
  let names=Object.keys(players).filter(name=>name.toLowerCase().includes(query)&&bowlingStats(name,selectedFormat)).sort((first,second)=>{
    let a=bowlingStats(second,selectedFormat),b=bowlingStats(first,selectedFormat);
    return (a?.wickets??-1)-(b?.wickets??-1)||((b?.economy??999)-(a?.economy??999));
  });
  let visibleNames=names.slice(0,bowlerVisible);
  $('bowlerBody').innerHTML=visibleNames.map(name=>{
    let stats=bowlingStats(name,selectedFormat);
    return `<tr><td><div class="table-name">${imgHtml(name,'')} ${name}</div></td><td>${flagHtml(players[name].team)} ${players[name].team}</td><td>${fmt(stats?.bowlingMatches)}</td><td>${fmt(stats?.ballsBowled)}</td><td>${fmt(stats?.wickets)}</td><td>${fmt(stats?.economy)}</td><td>${fmt(stats?.bowlingAverage)}</td><td>${fmt(stats?.bowlingStrikeRate)}</td><td>${fmt(stats?.maidens)}</td></tr>`;
  }).join('')||'<tr><td colspan="9" style="text-align:center;color:var(--muted)">No recorded bowling innings in this source format.</td></tr>';
  $('bowlerLoadMore').classList.toggle('hidden',visibleNames.length>=names.length);
  refreshPhotos(visibleNames);
}
function xiScore(name,selectedFormat){
  let batting=battingStats(name,selectedFormat),bowling=bowlingStats(name,selectedFormat);
  let recent=recentFor(name,selectedFormat).reduce((sum,innings)=>sum+innings.runs,0);
  let battingScore=(batting?.runs||0)/50+(batting?.average||0)*1.5+(batting?.strikeRate||0)/20+recent*.35;
  let economy=bowling?.economy;
  let bowlingScore=(bowling?.wickets||0)*4+(bowling?.ballsBowled||0)/20+(economy?Math.max(0,12-economy)*2:0);
  let latestBatting=batting?.lastBattingDate||'',latestBowling=bowling?.lastBowlingDate||'',latest=Math.max(latestBatting.localeCompare(CURRENT_YEAR_START)>=0?1:0,latestBowling.localeCompare(CURRENT_YEAR_START)>=0?1:0);
  return battingScore+bowlingScore+(latest*40);
}
function activeXiRecords(selectedFormat,gender){
  return Object.values(CRICFY_CRICSHEET.players).filter(record=>{
    if(record.gender!==gender)return false;
    let stats=record.formats?.[selectedFormat];
    if(!stats||(stats.matches<=0&&stats.bowlingMatches<=0))return false;
    let latestBatting=stats.lastBattingDate||'';
    let latestBowling=stats.lastBowlingDate||'';
    return latestBatting>=CURRENT_YEAR_START||latestBowling>=CURRENT_YEAR_START;
  });
}
function updateXiTeamOptions(){
  if(!$('xiTeam')||!$('xiGender')||!$('xiFormat'))return;
  let teamSelect=$('xiTeam'),selectedTeam=teamSelect.value;
  let records=activeXiRecords($('xiFormat').value,$('xiGender').value);
  let teams=[...new Set(records.map(record=>{
    let team=record.team||'';
    return team.replace(/ Women$/,'');
  }).filter(team=>team&&team!=='Mixed'))].sort((a,b)=>a.localeCompare(b));
  teamSelect.innerHTML=`<option value="">All countries</option>${teams.map(team=>`<option value="${escapeHtml(team)}">${countryFlag(team)} ${escapeHtml(team)}</option>`).join('')}`;
  if(teams.includes(selectedTeam))teamSelect.value=selectedTeam;
  else teamSelect.value='';
}
function buildXI(){
  let selectedFormat=$('xiFormat').value,team=$('xiTeam').value,gender=$('xiGender').value;
  let activeRecords=activeXiRecords(selectedFormat,gender).filter(record=>{
    if(team){
      let baseTeam=(record.team||'').replace(/ Women$/,'');
      if(normalizePlayerName(baseTeam)!==normalizePlayerName(team))return false;
    }
    return true;
  });
  if(!activeRecords.length){
    $('xiBody').innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--muted)">No active players with a 2026 recorded innings in this country and format.</td></tr>';
    return;
  }
  let fullNames=new Set(activeRecords.filter(record=>{
    let first=(record.name||'').split(/\s+/)[0]||'';
    return first.length>3;
  }).map(record=>normalizePlayerName(record.name)));
  let pool=[...new Map(
    activeRecords.filter(record=>{
      let parts=(record.name||'').split(/\s+/);
      if(parts.length<2||parts[0].length>3)return true;
      let surname=normalizePlayerName(parts[parts.length-1]);
      let hasFullName=[...fullNames].some(fullName=>fullName.endsWith(surname)&&fullName!==normalizePlayerName(record.name));
      return !hasFullName;
    }).map(record=>{
      let canonical=Object.keys(players).find(name=>cricsheetRecordFor(name)===record);
      canonical=canonical||record.name;
      return [normalizePlayerName(canonical),canonical];
    })
  ).values()];
  let slots=[
    ['Opening Batter',name=>/opening|batter|batting/i.test(players[name].role)],
    ['Opening Batter',name=>/opening|batter|batting/i.test(players[name].role)],
    ['Top-order Batter',name=>/top|middle|batter|batting/i.test(players[name].role)],
    ['Middle-order Batter',name=>/middle|batter|batting/i.test(players[name].role)],
    ['Wicketkeeper',name=>/wicketkeeper/i.test(players[name].role)],
    ['All-rounder',name=>/all-rounder/i.test(players[name].role)],
    ['All-rounder',name=>/all-rounder/i.test(players[name].role)],
    ['Fast Bowler',name=>/fast|pace/i.test(players[name].role)||bowlingStats(name,selectedFormat)],
    ['Spin Bowler',name=>/spin|leg-break|off-break/i.test(players[name].role)||(/bowler/i.test(players[name].role)&&!(/fast|pace/i.test(players[name].role)))],
    ['Seam / Pace Bowler',name=>/fast|pace/i.test(players[name].role)||bowlingStats(name,selectedFormat)],
    ['Bowler',()=>true]
  ];
  let used=new Set();
  let rows=slots.map(([role,filter])=>{
    let rankedRoleCandidates=pool
      .filter(name=>filter(name)&&!used.has(name))
      .sort((a,b)=>xiScore(b,selectedFormat)-xiScore(a,selectedFormat));
    let fallbackCandidates=pool
      .filter(name=>!used.has(name))
      .sort((a,b)=>xiScore(b,selectedFormat)-xiScore(a,selectedFormat));
    let candidates=[...new Map(
      [...rankedRoleCandidates, ...fallbackCandidates].map(name=>[name,name])
    ).values()].slice(0,6);
    let selected=candidates[0];
    if(selected)used.add(selected);
    let batting=battingStats(selected,selectedFormat),bowling=bowlingStats(selected,selectedFormat);
    let recent=recentFor(selected,selectedFormat).map(innings=>innings.runs).join(', ')||'—';
    let options=candidates.map(name=>`<option value="${escapeHtml(name)}" ${name===selected?'selected':''}>${escapeHtml(name)}</option>`).join('');
    let photo=selected?imgHtml(selected,'xi-player-photo'):'';
    return `<tr><td>${role}</td><td><div class="xi-player-cell">${photo}${flagHtml(players[selected]?.team||'International','xi-country-flag')}<select class="select-control xi-select" data-xi-slot="${escapeHtml(role)}" data-xi-selected="${escapeHtml(selected||'')}" style="width:210px">${options||'<option value="">No player available</option>'}</select></div></td><td>${fmt(batting?.runs)}</td><td>${fmt(batting?.average)}</td><td>${recent}</td><td>${fmt(bowling?.wickets)}</td><td>${fmt(bowling?.economy)}</td></tr>`;
  });
  $('xiBody').innerHTML=rows.join('');
  refreshPhotos(pool.slice(0,200));
  document.querySelectorAll('.xi-select').forEach(select=>{
    select.onchange=()=>{
      let row=select.closest('tr'),name=select.value;
      let duplicate=[...document.querySelectorAll('.xi-select')].some(other=>other!==select&&other.value===name);
      if(duplicate){
        select.value=select.dataset.xiSelected||'';
        toast('This player is already selected in another XI role');
        return;
      }
      select.dataset.xiSelected=name;
      let batting=battingStats(name,$('xiFormat').value),bowling=bowlingStats(name,$('xiFormat').value);
      let recent=recentFor(name,$('xiFormat').value).map(innings=>innings.runs).join(', ')||'—';
      let photo=row.querySelector('.xi-player-photo');
      if(photo)photo.src=getFallback(name);
      if(photo&&photoCache[name])photo.src=photoCache[name];
      let teamFlag=row.querySelector('.xi-country-flag');
      if(teamFlag){teamFlag.textContent=countryFlag(players[name]?.team||'International');teamFlag.setAttribute('aria-label',players[name]?.team||'International')}
      row.children[2].textContent=fmt(batting?.runs);
      row.children[3].textContent=fmt(batting?.average);
      row.children[4].textContent=recent;
      row.children[5].textContent=fmt(bowling?.wickets);
      row.children[6].textContent=fmt(bowling?.economy);
    };
  });
}
function evaluatePrototype(selectedFormat,gender){
  let actuals=[],predictions=[];
  Object.values(CRICFY_CRICSHEET.players).forEach(record=>{
    if(record.gender!==gender)return;
    let innings=[...(record.formats?.[selectedFormat]?.recent||[])].reverse();
    for(let index=2;index<innings.length;index++){
      let prior=innings.slice(Math.max(0,index-2),index);
      if(prior.length!==2)continue;
      predictions.push(prior.reduce((sum,entry)=>sum+entry.runs,0)/prior.length);
      actuals.push(innings[index].runs);
    }
  });
  if(!actuals.length)return{count:0,mae:null,rmse:null,r2:null,withinTen:null,withinTenCount:0};
  let errors=actuals.map((actual,index)=>actual-predictions[index]);
  let mae=errors.reduce((sum,error)=>sum+Math.abs(error),0)/errors.length;
  let rmse=Math.sqrt(errors.reduce((sum,error)=>sum+error*error,0)/errors.length);
  let actualMean=actuals.reduce((sum,actual)=>sum+actual,0)/actuals.length;
  let totalVariance=actuals.reduce((sum,actual)=>sum+(actual-actualMean)**2,0);
  let residualVariance=errors.reduce((sum,error)=>sum+error*error,0);
  return{
    count:actuals.length,
    mae,
    rmse,
    r2:totalVariance?1-residualVariance/totalVariance:null,
    withinTen:errors.filter(error=>Math.abs(error)<=10).length*100/errors.length,
    withinTenCount:errors.filter(error=>Math.abs(error)<=10).length
  };
}
function renderModelEvaluation(){
  let gender=$('evalGender').value,selectedFormat=$('evalFormat').value;
  let metrics=evaluatePrototype(selectedFormat,gender);
  let formatName=selectedFormat==='T20'?'T20':selectedFormat;
  $('modelEvalMetrics').innerHTML=[
    ['Backtested forecasts',fmt(metrics.count),'Chronological holdout samples'],
    ['Mean absolute error',metrics.mae===null?'—':metrics.mae.toFixed(1),'Fewer runs is better'],
    ['Root mean squared error',metrics.rmse===null?'—':metrics.rmse.toFixed(1),'Fewer runs is better'],
    ['Model accuracy · within ±10 runs',metrics.withinTen===null?'—':`${metrics.withinTen.toFixed(1)}%`,`${fmt(metrics.withinTenCount)} of ${fmt(metrics.count)} test forecasts`],
    ['R² score',metrics.r2===null?'—':metrics.r2.toFixed(3),'Can be negative if weaker than the mean']
  ].map(([label,value,detail])=>`<article class="model-eval-card"><span>${label}</span><strong>${value}</strong><small>${detail}</small></article>`).join('');
  $('modelEvalNote').textContent=metrics.count
    ?`Walk-forward results · ${gender==='male'?'Men':'Women'} · ${formatName} · All countries · ${CRICFY_CRICSHEET.meta.dataThrough}. Each forecast uses two earlier recorded innings and tests against the next one. Only the latest five innings per player are available for this validation, so treat these as prototype diagnostics, not a certified ML model score. Optional pitch and batting-position adjustments are excluded.`
    :'No eligible three-innings test sequences are available for this selection.';
}
function formatMatchDate(value){
  if(!value)return 'Time to be confirmed';
  let date=new Date(value);
  return Number.isNaN(date.getTime())?'Time to be confirmed':date.toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}
function updateMatchFilterOptions(){
  if(!$('matchesFormat')||!$('matchesState'))return;
  const formatSelect=$('matchesFormat'),stateSelect=$('matchesState');
  const selectedFormat=formatSelect.value,selectedState=stateSelect.value;
  const formats=['Test','ODI','T20'];
  formatSelect.innerHTML='<option value="">All formats</option>'+formats.map(format=>{
    const count=liveMatches.filter(match=>match.format===format).length;
    const availability=matchesLoadState==='ready'?`${count} available`:'availability unknown';
    return `<option value="${format}" ${count===0?'disabled':''}>${format} (${availability})</option>`;
  }).join('');
  const states=[['live','Live now',match=>match.isLive],['upcoming','Upcoming',match=>!match.isLive]];
  stateSelect.innerHTML='<option value="">Live and upcoming</option>'+states.map(([value,label,predicate])=>{
    const count=liveMatches.filter(predicate).length;
    const availability=matchesLoadState==='ready'?`${count} available`:'availability unknown';
    return `<option value="${value}" ${count===0?'disabled':''}>${label} (${availability})</option>`;
  }).join('');
  if([...formatSelect.options].some(option=>option.value===selectedFormat&&!option.disabled))formatSelect.value=selectedFormat;
  if([...stateSelect.options].some(option=>option.value===selectedState&&!option.disabled))stateSelect.value=selectedState;
}
function matchTrackingKey(match){return String(match.id||match.name||`${match.team1}|${match.team2}|${match.dateTimeGMT}`)}
function matchIsFollowed(match){return followedMatches.includes(matchTrackingKey(match))||[match.team1,match.team2].some(team=>followedTeams.includes(team))}
function toggleFollowTeam(team){followedTeams=followedTeams.includes(team)?followedTeams.filter(item=>item!==team):[...followedTeams,team];localStorage.setItem('cricfy-followed-teams',JSON.stringify(followedTeams));renderMatchFollowControls();renderLiveMatches()}
function toggleFollowMatch(key){followedMatches=followedMatches.includes(key)?followedMatches.filter(item=>item!==key):[...followedMatches,key];localStorage.setItem('cricfy-followed-matches',JSON.stringify(followedMatches));renderLiveMatches();updateMatchAlertPolling()}
async function enableMatchNotifications(){if(!('Notification'in window)){toast('This browser does not support notifications');return}let permission=Notification.permission;if(permission==='default')permission=await Notification.requestPermission();$('matchNotificationBtn').textContent=permission==='granted'?'✓ Notifications on':permission==='denied'?'Notifications blocked':'Enable notifications';if(permission==='granted')toast('Match notifications enabled')}
function notifyFollowedMatchUpdates(matches){let previous=new Map(matchSnapshots.map(item=>[item.key,item]));matches.forEach(match=>{if(!matchIsFollowed(match))return;let key=matchTrackingKey(match),current={key,status:match.status,team1Score:match.team1Score,team2Score:match.team2Score,isLive:match.isLive},old=previous.get(key);if(old&&(old.status!==current.status||old.team1Score!==current.team1Score||old.team2Score!==current.team2Score||old.isLive!==current.isLive)&&('Notification'in window)&&Notification.permission==='granted'){let score=[match.team1Score,match.team2Score].filter(Boolean).join(' · ');new Notification(`${match.isLive?'Live update':'Match update'}: ${match.team1||''} vs ${match.team2||''}`,{body:[score,match.status].filter(Boolean).join(' — '),tag:`cricfy-${key}`})}});matchSnapshots=matches.map(match=>({key:matchTrackingKey(match),status:match.status,team1Score:match.team1Score,team2Score:match.team2Score,isLive:match.isLive}));localStorage.setItem('cricfy-match-snapshots',JSON.stringify(matchSnapshots))}
function updateMatchAlertPolling(){if(matchesRefreshTimer&&followedTeams.length===0&&followedMatches.length===0&&activePage!=='matches'){clearInterval(matchesRefreshTimer);matchesRefreshTimer=null}if(!matchesRefreshTimer&&activePage==='matches')matchesRefreshTimer=setInterval(()=>{if(document.visibilityState==='visible'&&(activePage==='matches'||followedTeams.length||followedMatches.length))loadLiveMatches()},120000)}
function renderMatchFollowControls(){
  let select=$('followTeamSelect');if(!select)return;
  let selected=select.value,teams=[...new Set([...liveMatches.flatMap(match=>[match.team1,match.team2]),...Object.values(CRICFY_CRICSHEET.players).map(record=>record.team)].filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  select.innerHTML='<option value="">Choose a team to follow</option>'+teams.map(team=>`<option value="${escapeHtml(team)}">${escapeHtml(team)}${followedTeams.includes(team)?' · Following':''}</option>`).join('');
  if(teams.includes(selected))select.value=selected;
  $('followTeamBtn').textContent=selected&&followedTeams.includes(selected)?'Unfollow team':'Follow team';
  $('matchNotificationBtn').textContent=('Notification'in window&&Notification.permission==='granted')?'✓ Notifications on':('Notification'in window&&Notification.permission==='denied')?'Notifications blocked':'Enable notifications';
  $('matchFollowSummary').textContent=`Following ${followedTeams.length} team${followedTeams.length===1?'':'s'} and ${followedMatches.length} match${followedMatches.length===1?'':'es'} · updates while Cricfy is open.`;
}
function renderLiveMatches(){
  if(!$('matchesGrid'))return;
  updateMatchFilterOptions();
  let selectedFormat=$('matchesFormat').value,state=$('matchesState').value;
  let matches=liveMatches.filter(match=>
    (!selectedFormat||match.format===selectedFormat)&&
    (!state||(state==='live'?match.isLive:!match.isLive))
  );
  $('matchesGrid').innerHTML=matches.map(match=>{
    let title=escapeHtml(match.name);
    let team1=escapeHtml(match.team1||'Team 1'),team2=escapeHtml(match.team2||'Team 2');
    let score1=escapeHtml(match.team1Score),score2=escapeHtml(match.team2Score);
    let score=score1||score2?`<div class="match-scores"><span>${flagHtml(match.team1)} ${team1}<b>${score1||'—'}</b></span><span>${flagHtml(match.team2)} ${team2}<b>${score2||'—'}</b></span></div>`:`<div class="match-teams">${flagHtml(match.team1)} ${team1}<span>VS</span>${team2} ${flagHtml(match.team2)}</div>`;
    return `<article class="panel match-card"><div class="match-card-top"><span class="match-format">${escapeHtml(match.format)}</span><span class="match-state ${match.isLive?'is-live':''}">${match.isLive?'● LIVE':'UPCOMING'}</span></div><h3>${title}</h3>${score}<p class="match-status">${escapeHtml(match.status)}</p><div class="match-meta"><span>◷ ${escapeHtml(formatMatchDate(match.dateTimeGMT))}</span><span>⌖ ${escapeHtml(match.venue)}</span></div><a class="btn btn-secondary match-watch" href="https://matchdekho.in/" target="_blank" rel="noopener noreferrer">Find watch option on MatchDekho ↗</a></article>`;
  }).join('');
  if(!matches.length&&liveMatches.length)$('matchesStatus').textContent='No matches match these filters. Choose a format or status marked available.';
  else if(matches.length)$('matchesStatus').textContent=`${matches.length} live or upcoming Test, ODI and T20 match${matches.length===1?'':'es'} · auto-refreshes every 2 minutes while this page is open.`;
  else if(matchesLoadState==='ready')$('matchesStatus').textContent='No live or upcoming Test, ODI or T20 fixtures are currently available from the provider.';
  else if(matchesLoadState==='error')$('matchesStatus').textContent=matchesLoadError;
}
async function loadLiveMatches(){
  let button=$('refreshMatches'),status=$('matchesStatus');
  if(!status||matchesLoading)return;
  matchesLoading=true;
  matchesLoadState='loading';
  matchesLoadError='';
  updateMatchFilterOptions();
  if(button)button.disabled=true;
  $('matchesUpdated').textContent='Checking match availability…';
  status.textContent='Loading live and upcoming matches…';
  try{
    if(location.protocol==='file:')throw new Error('Open Cricfy through the local server and configure CRICFY_CRICKET_API_KEY to check match availability.');
    const response=await fetch(cricfyApiUrl('/api/cricket-matches'),{cache:'no-store'});
    let payload;
    try{payload=await response.json()}catch{throw new Error('Live match API is unavailable. Start start_cricfy.ps1 to check match availability.')}
    if(!payload||typeof payload!=='object')throw new Error('The live match provider returned an invalid response.');
    if(!response.ok||!payload.ok)throw new Error(payload.message||`Live match request failed (${response.status}).`);
    if(!Array.isArray(payload.matches))throw new Error('The live match provider returned an invalid match list.');
    liveMatches=payload.matches;
    notifyFollowedMatchUpdates(liveMatches);
    matchesUpdatedAt=payload.updatedAt||new Date().toISOString();
    matchesLoadState='ready';
    $('matchesUpdated').textContent=`Availability checked ${new Date(matchesUpdatedAt).toLocaleTimeString()}`;
    renderLiveMatches();
  }catch(error){
    matchesLoadState='error';
    let serverUnavailable=/failed to fetch|networkerror/i.test(error.message||'');
    matchesLoadError=serverUnavailable?'Start start_cricfy.ps1 in the project folder to connect live scores.':(error.message||'Could not load live match availability.');
    $('matchesUpdated').textContent='Live match availability unavailable';
    updateMatchFilterOptions();
    $('matchesGrid').innerHTML='';
    status.textContent=matchesLoadError;
  }finally{
    if(button)button.disabled=false;
    matchesLoading=false;
  }
}
const renderLiveMatchesBase=renderLiveMatches;
renderLiveMatches=function(){
  renderLiveMatchesBase();renderMatchFollowControls();
  let selectedFormat=$('matchesFormat')?.value||'',state=$('matchesState')?.value||'';
  let visible=liveMatches.filter(match=>(!selectedFormat||match.format===selectedFormat)&&(!state||(state==='live'?match.isLive:!match.isLive)));
  document.querySelectorAll('.match-card').forEach((card,index)=>{let match=visible[index];if(!match)return;let button=document.createElement('button');button.type='button';button.className='btn btn-secondary match-follow-btn';button.textContent=followedMatches.includes(matchTrackingKey(match))?'✓ Following match':'☆ Follow match';button.onclick=()=>toggleFollowMatch(matchTrackingKey(match));let watch=card.querySelector('.match-watch');if(watch)card.insertBefore(button,watch)});
};
function runPrediction(){
  let name=$('predPlayer').value,selectedFormat=$('predFormat').value,stats=battingStats(name,selectedFormat);
  let recent=recentFor(name,selectedFormat);
  if(!stats||recent.length<2){
    $('predictionResult').innerHTML='<div class="result-badge">INSUFFICIENT RECENT DATA</div><h2>Estimate unavailable</h2><p>At least two recorded innings in this format are needed for the recent-form prototype.</p>';
    return;
  }
  let position=Number($('batPos').value),factor=Number($('conditions').value);
  let baseline=recent.slice(0,2).reduce((sum,innings)=>sum+innings.runs,0)/2;
  let estimate=Math.round(Math.max(0,baseline*(1.15-(position-1)*.12)*factor));
  let range=Math.max(8,Math.round(estimate*.3));
  $('predictionResult').innerHTML=`<div class="result-badge">PROTOTYPE ESTIMATE · ${selectedFormat}</div><div class="prediction-score">${estimate}</div><h2>Expected Runs</h2><p><b>${name}</b> · estimated range ${Math.max(0,estimate-range)}–${estimate+range} runs.<br>Base forecast: average of the two latest recorded innings (${baseline.toFixed(1)} runs). Optional position and pitch adjustments are heuristic.</p><span class="model-source-note">An experimental estimate, not a validated ML result or match guarantee.</span>`;
}
function moveGameBatter(delta){if(!gameState.active||gameState.innings!==1)return;gamePlayerLane=Math.max(59,Math.min(77,gamePlayerLane+delta));let batter=$('pageGame').querySelector('.game-field-batter'),ball=$('gameBall');if(batter)batter.style.left=`${gamePlayerLane}%`;if(ball)ball.style.setProperty('--game-batter-x',`${gamePlayerLane}%`)}
function stepGameBatter(direction){if(!gameState.active||gameState.innings!==1)return;gamePlayerStep=Math.max(-2,Math.min(2,gamePlayerStep+direction));let batter=$('pageGame').querySelector('.game-field-batter');if(batter){let base=window.matchMedia('(max-width: 580px)').matches?96:112;batter.style.bottom=`${base+gamePlayerStep*14}px`}}
function toggleGameRunIntent(){if(!gameState.active||gameState.innings!==1)return;gameRunIntent=!gameRunIntent;let button=$('gameRunToggle'),batter=$('pageGame').querySelector('.game-field-batter');button?.setAttribute('aria-pressed',String(gameRunIntent));if(button)button.textContent=gameRunIntent?'✓ Sprint ready':'Run between wickets';if(gameRunIntent){batter.classList.remove('game-running');void batter.offsetWidth;batter.classList.add('game-running');clearTimeout(batter.runTimer);batter.runTimer=setTimeout(()=>batter.classList.remove('game-running'),760)}else batter.classList.remove('game-running')}
function selectGameIntent(intent){if(!GAME_SHOTS.includes(intent))return;gameSelectedIntent=intent;document.querySelectorAll('[data-game-shot]').forEach(button=>button.classList.toggle('selected',Number(button.dataset.gameShot)===intent))}
function stopRealtimeGameLoop(){clearTimeout(gameDeliveryTimer);clearTimeout(gameSwingTimer);if(gameAnimationFrame)cancelAnimationFrame(gameAnimationFrame);gameDeliveryTimer=0;gameSwingTimer=0;gameAnimationFrame=0;if(gameState){gameState.ballDelivery=null;gameState.queuedShot=null}$('gameResultPop')?.classList.remove('show');if($('gameBall'))$('gameBall').style.opacity='0'}
function startRealtimeGameLoop(){if(!gameState.active||activePage!=='game'||gameState.ballDelivery||gameDeliveryTimer)return;scheduleRealtimeDelivery(700)}
function scheduleRealtimeDelivery(delay=850){clearTimeout(gameDeliveryTimer);if(!gameState.active||activePage!=='game')return;gameDeliveryTimer=setTimeout(()=>{gameDeliveryTimer=0;beginRealtimeDelivery()},delay)}
function beginRealtimeDelivery(){
  if(!gameState.active||activePage!=='game'||gameState.ballDelivery)return;
  let queuedShot=Number.isInteger(gameState.queuedShot)?gameState.queuedShot:null;
  let shotIntent=queuedShot===null?gameSelectedIntent:queuedShot;
  let delivery=gameState.innings===1?chooseCpuDelivery(shotIntent):GAME_DELIVERIES[gameSelectedIntent];
  let deliveryId=Number(Object.keys(GAME_DELIVERIES).find(id=>GAME_DELIVERIES[id]===delivery));
  gameState.ballDelivery={deliveryId,delivery,startedAt:performance.now(),duration:1450,swung:false,missed:false,shotIntent,autoSwing:gameState.innings===1&&queuedShot!==null};
  gameState.queuedShot=null;
  let ball=$('gameBall');ball.classList.remove('game-ball-hit','game-ball-out','game-ball-dot');ball.style.animation='';ball.style.opacity='1';
  if($('gameActionButton'))$('gameActionButton').disabled=gameState.innings!==1;
  $('gameLiveMessage').textContent=gameState.innings===1?(queuedShot===null?`${delivery.label} coming in — tap a shot to play, or time Swing now yourself.`:`${delivery.label} coming in — ${GAME_SHOT_LABELS[shotIntent]} queued.`):`${delivery.label} on the way — the CPU will play this delivery.`;
  gameAnimationFrame=requestAnimationFrame(animateRealtimeDelivery);
}
function animateRealtimeDelivery(now){
  if(!gameState.active||!gameState.ballDelivery||activePage!=='game'){gameAnimationFrame=0;return}
  let state=gameState.ballDelivery,progress=Math.min(1,(now-state.startedAt)/state.duration),ball=$('gameBall');
  let destination=gameState.innings===1?gamePlayerLane:68;
  ball.style.left=`${36+(destination-36)*progress}%`;
  ball.style.top=`${44+12*progress-4*Math.sin(progress*Math.PI)-2.5*gamePlayerStep*progress}%`;
  ball.style.opacity=progress<1?'1':'0';
  if(state.autoSwing&&!state.swung&&progress>=.77){state.autoSwing=false;swingCricketGame(state.shotIntent);if(gameState.ballDelivery!==state){gameAnimationFrame=0;return}}
  if(progress<1){gameAnimationFrame=requestAnimationFrame(animateRealtimeDelivery);return}
  gameAnimationFrame=0;
  if(gameState.innings===2){gameState.ballDelivery=null;playGameDelivery(state.deliveryId);return}
  let outcome=state.missed?{runs:0,wicket:Math.random()<.07}: {runs:0,wicket:Math.random()<.035};
  let description=outcome.wicket?`WICKET! ${gameState.currentBatter} misses ${state.delivery.label.toLowerCase()} and loses their wicket.`:`${state.delivery.label} beats the bat. No run.`;
  gameState.ballDelivery=null;recordGameBall(outcome,description,gameSelectedIntent);
}
function swingCricketGame(intentOverride){
  if(!gameState.active)return;
  if(gameState.innings!==1){advanceGameBall();return}
  let state=gameState.ballDelivery;
  if(!state){$('gameLiveMessage').textContent='Wait for the bowler to release the next ball.';return}
  if(state.swung)return;
  let shotIntent=GAME_SHOTS.includes(intentOverride)?intentOverride:(state.shotIntent??gameSelectedIntent);
  state.swung=true;
  let batter=$('pageGame').querySelector('.game-field-batter');batter.classList.add('game-swinging');clearTimeout(gameSwingTimer);gameSwingTimer=setTimeout(()=>batter.classList.remove('game-swinging'),360);
  let progress=(performance.now()-state.startedAt)/state.duration;
  if(progress<.59||progress>.91){state.missed=true;$('gameLiveMessage').textContent=progress<.59?'Too early — the ball is still on its way.':'Too late — the ball has passed the bat.';return}
  let footworkBonus=(state.delivery.label==='Bouncer'&&gamePlayerStep<0)?0.06:(state.delivery.label==='Yorker'&&gamePlayerStep>0)?0.06:-0.02;
  let quality=Math.max(0,Math.min(1,1-Math.abs(progress-.77)/.14+footworkBonus)),outcome=resolveGameOutcome(shotIntent,gameState.bowler,state.delivery,(.55-quality)*.08);
  if(!outcome.wicket&&quality<.35&&outcome.runs>=4)outcome.runs=1;
  let calledForRun=gameRunIntent;gameRunIntent=false;
  if(calledForRun&&!outcome.wicket){if(outcome.runs===1&&Math.random()<.68)outcome.runs=2;else if(outcome.runs===2&&Math.random()<.3)outcome.runs=3;else if(outcome.runs===0&&Math.random()<.16){outcome.wicket=true;outcome.runOut=true}}
  let description=outcome.wicket?(outcome.runOut?`RUN OUT! A risky run costs ${gameState.currentBatter}'s wicket.`:`WICKET! ${gameState.bowler} beats ${gameState.currentBatter} with a ${state.delivery.label.toLowerCase()}.`):outcome.runs===6?`SIX! ${gameState.currentBatter} launches the ${state.delivery.label.toLowerCase()} into the stands.`:outcome.runs===4?`FOUR! ${gameState.currentBatter} drives ${gameState.bowler} to the boundary.`:outcome.runs===0?`Missed! ${gameState.bowler}'s ${state.delivery.label.toLowerCase()} beats the bat.`:`${gameState.currentBatter} runs ${outcome.runs} off ${gameState.bowler}'s ${state.delivery.label.toLowerCase()}.`;
  gameState.ballDelivery=null;recordGameBall(outcome,description,shotIntent);
}
function advanceGameBall(){if(!gameState.active)return;if(gameState.innings===1){swingCricketGame();return}if(gameState.ballDelivery)return;clearTimeout(gameDeliveryTimer);gameDeliveryTimer=0;beginRealtimeDelivery()}
function handleGameKeyboard(event){
  if(activePage!=='game'||!gameState.active||event.ctrlKey||event.altKey||event.metaKey)return;
  if(event.target instanceof HTMLElement&&(/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable))return;
  let key=event.key.toLowerCase();
  if(key==='arrowleft'||key==='a'){event.preventDefault();moveGameBatter(-3)}
  else if(key==='arrowright'||key==='d'){event.preventDefault();moveGameBatter(3)}
  else if(key==='arrowup'||key==='w'){event.preventDefault();stepGameBatter(1)}
  else if(key==='arrowdown'||key==='s'){event.preventDefault();stepGameBatter(-1)}
  else if(key==='r'){event.preventDefault();toggleGameRunIntent()}
  else if(key===' '){event.preventDefault();advanceGameBall()}
  else if(['0','1','2','3','4','6'].includes(key)){event.preventDefault();if(gameState.innings===1)playGameShot(Number(key));else selectGameIntent(Number(key))}
}
function gameOversText(balls){return `${Math.floor(balls/6)}.${balls%6}`}
function gameClamp(value,min,max){return Math.max(min,Math.min(max,value))}
function gameWeightedChoice(entries){
  let total=entries.reduce((sum,entry)=>sum+entry[1],0),roll=Math.random()*total;
  for(let [value,weight] of entries){roll-=weight;if(roll<0)return value}
  return entries[entries.length-1][0];
}
function gamePlayerSkill(name,kind){
  if(kind==='bowling'){
    let stats=bowlingStats(name,'T20')||bowlingStats(name,'ODI')||bowlingStats(name,'Test');
    if(!stats)return 0;
    let economy=Number(stats.economy)||7.5,wickets=Number(stats.wickets)||0,matches=Number(stats.bowlingMatches)||1;
    return gameClamp((7.5-economy)*.012+Math.min(wickets/matches,2)*.018,-.025,.065);
  }
  let stats=battingStats(name,'T20')||battingStats(name,'ODI')||battingStats(name,'Test');
  return stats?gameClamp(((Number(stats.strikeRate)||100)-100)*.0012,-.045,.055):0;
}
function resolveGameOutcome(intent,bowler,delivery,pressure=0){
  const outcomes={
    0:[[0,.84],[1,.11],[2,.035],[4,.015]],
    1:[[0,.12],[1,.7],[2,.14],[3,.02],[4,.02]],
    2:[[0,.08],[1,.14],[2,.58],[3,.1],[4,.08],[6,.02]],
    3:[[0,.08],[1,.1],[2,.2],[3,.3],[4,.22],[6,.1]],
    4:[[0,.08],[1,.08],[2,.08],[3,.08],[4,.5],[6,.18]],
    6:[[0,.2],[1,.05],[2,.08],[4,.35],[6,.32]]
  };
  const wicketRisk={0:.025,1:.035,2:.055,3:.095,4:.13,6:.19};
  let batterName=gameState.currentBatter||gameState.player;
  let wicketChance=gameClamp(wicketRisk[intent]+gamePlayerSkill(bowler,'bowling')+(delivery?.difficulty||0)*.32+pressure-gamePlayerSkill(batterName,'batting'),.015,.34);
  if(Math.random()<wicketChance)return {runs:0,wicket:true};
  return {runs:gameWeightedChoice(outcomes[intent]||outcomes[1]),wicket:false};
}
function chooseCpuDelivery(intent){
  let options=GAME_SHOTS.map(id=>[id,1]);
  if(intent===6)options=[[0,3],[1,1],[2,2],[3,1],[4,2],[6,3]];
  else if(intent===0)options=[[0,1],[1,2],[2,1],[3,3],[4,2],[6,1]];
  let lastIntents=gameState.history.filter(item=>item.innings===1).slice(0,2).map(item=>item.intent);
  if(lastIntents.length===2&&lastIntents.every(previous=>previous===intent)){
    let adaptive=options.findIndex(([id])=>id===3);
    if(adaptive>=0)options[adaptive][1]+=3;
  }
  return GAME_DELIVERIES[gameWeightedChoice(options)];
}
function chooseCpuIntent(name,target){
  let skill=gamePlayerSkill(name,'batting'),ballsLeft=GAME_OVERS*6-gameState.balls;
  let runsNeeded=Math.max(0,target-gameState.runs);
  let requiredRate=ballsLeft?runsNeeded/(ballsLeft/6):20;
  let aggression=gameClamp(.25+skill+Math.max(0,requiredRate-7)*.035,.1,.78);
  return gameWeightedChoice([
    [0,.12-aggression*.1],[1,.27-aggression*.12],[2,.2],[3,.1+aggression*.04],
    [4,.2+aggression*.13],[6,.11+aggression*.16]
  ]);
}
function gameLineup(team,firstBatter){
  let roster=gameBatterNames(team).filter(name=>name!==firstBatter);
  return [firstBatter,...roster];
}
function setCurrentBatter(name){
  gameState.currentBatter=name;
  $('gamePlayerName').textContent=name;
  $('gameFieldBatterName').textContent=name;
  $('gamePlayerPortrait').innerHTML=imgHtml(name,'game-player-avatar');
  $('gameFieldBatterPortrait').innerHTML=imgHtml(name,'game-field-avatar');
  refreshPhotos([name]);
}
function setActiveBowler(name,isUser){
  $('gameBowlerName').textContent=name;
  $('gameBowlerRole').textContent=players[name]?.role||'Bowler';
  $('gameBowlerTag').textContent=isUser?'YOUR BOWLER':'CPU BOWLER';
  $('gameFieldBowlerName').textContent=name;
  $('gameBowlerPortrait').innerHTML=imgHtml(name,'game-bowler-avatar');
  $('gameFieldBowlerPortrait').innerHTML=imgHtml(name,'game-field-avatar');
  refreshPhotos([name]);
}
function renderGameState(){
  if(!$('gameScore'))return;
  $('gameScore').textContent=`${gameState.runs}/${gameState.wickets}`;
  $('gameOvers').textContent=gameOversText(gameState.balls);
  let isCpuInnings=gameState.innings===2;
  let activeBowler=isCpuInnings?gameState.userBowler:gameState.bowler;
  let activeTeam=isCpuInnings?gameState.opponentCountry:players[gameState.player]?.team||'';
  let target=gameState.firstInnings?gameState.firstInnings.runs+1:null;
  let ballsLeft=GAME_OVERS*6-gameState.balls;
  $('gameRunRate').textContent=isCpuInnings?(ballsLeft?Math.max(0,target-gameState.runs)/(ballsLeft/6):'0.00'):(gameState.balls?(gameState.runs/(gameState.balls/6)).toFixed(2):'0.00');
  $('gameRateLabel').textContent=isCpuInnings?'REQUIRED RR':'RUN RATE';
  $('gameTarget').textContent=isCpuInnings&&target?target:'—';
  $('gameBatterTag').textContent=isCpuInnings?'CPU BATTER':'YOUR BATTER';
  $('gameTeamTag').textContent=activeTeam;
  $('gameInningsBadge').textContent=isCpuInnings?'2ND INNINGS · CHASE':'1ST INNINGS · BAT';
  $('gameHomeTeam').innerHTML=`${countryFlag(players[gameState.player]?.team)||'🏳️'} ${escapeHtml(players[gameState.player]?.team||'Your team')}`;
  $('gameAwayTeam').innerHTML=`${countryFlag(gameState.opponentCountry)||'🏳️'} ${escapeHtml(gameState.opponentCountry||'Opponent')}`;
  if($('gamePlayerName').textContent!==gameState.currentBatter)setCurrentBatter(gameState.currentBatter);
  if($('gameBowlerName').textContent!==activeBowler||$('gameBowlerTag').textContent!==(isCpuInnings?'YOUR BOWLER':'CPU BOWLER'))setActiveBowler(activeBowler,isCpuInnings);
  $('gameStatus').textContent=gameState.message;
  $('gameLiveMessage').textContent=gameState.message;
  ['gamePlayer','gameOwnBowler','gameOpponentCountry','gameOpponentBatter','gameBowler'].forEach(id=>$(id).disabled=gameState.active);
  $('gameStart').disabled=gameState.active;
  $('gameStart').textContent=gameState.phase==='finished'?'↻ Play again':'▶ Start match';
  $('gameContinue').classList.toggle('hidden',gameState.phase!=='innings-break');
  $('gameReplay').classList.toggle('hidden',gameState.phase!=='finished');
  $('gameControlTitle').textContent=isCpuInnings?'Choose your delivery':'Choose your shot';
  $('gameHowTo').textContent=isCpuInnings?'Choose a delivery; the CPU plays it as it arrives.':'Tap a shot to queue it, or use Swing now / Space to time your swing. Call a run with R.';
  let onFieldBatter=$('pageGame').querySelector('.game-field-batter');if(onFieldBatter){onFieldBatter.style.left=`${gamePlayerLane}%`;let base=window.matchMedia('(max-width: 580px)').matches?96:112;onFieldBatter.style.bottom=`${base+gamePlayerStep*14}px`}$('gameBall').style.setProperty('--game-batter-x',`${gamePlayerLane}%`);
  if($('gameRunToggle')){$('gameRunToggle').disabled=!gameState.active||isCpuInnings;$('gameRunToggle').setAttribute('aria-pressed',String(gameRunIntent));$('gameRunToggle').textContent=gameRunIntent?'✓ Sprint ready':'Run between wickets'}
  if($('gameMoveLeft'))$('gameMoveLeft').disabled=!gameState.active||isCpuInnings;
  if($('gameMoveRight'))$('gameMoveRight').disabled=!gameState.active||isCpuInnings;
  if($('gameStepBack'))$('gameStepBack').disabled=!gameState.active||isCpuInnings;
  if($('gameStepForward'))$('gameStepForward').disabled=!gameState.active||isCpuInnings;
  if($('gameActionButton')){$('gameActionButton').disabled=!gameState.active||(isCpuInnings?Boolean(gameState.ballDelivery):!Boolean(gameState.ballDelivery));$('gameActionButton').textContent=isCpuInnings?'Bowl next':'Swing now'}
  document.querySelectorAll('[data-game-shot]').forEach(button=>{
    let intent=Number(button.dataset.gameShot),delivery=GAME_DELIVERIES[intent];
    button.disabled=!gameState.active;
    button.classList.toggle('selected',intent===gameSelectedIntent);
    button.querySelector('strong').textContent=isCpuInnings?delivery.icon:intent;
    button.querySelector('span').textContent=isCpuInnings?delivery.label:GAME_SHOT_LABELS[intent];
    button.setAttribute('aria-label',isCpuInnings?delivery.label:GAME_SHOT_LABELS[intent]);
  });
  $('gameBallLog').innerHTML=gameState.history.length?gameState.history.map(delivery=>`<li class="game-ball-event ${delivery.wicket?'game-wicket':''}"><span>${delivery.over}</span><p>${escapeHtml(delivery.description)}</p><strong>${delivery.wicket?'W':delivery.runs}</strong></li>`).join(''):'<li class="game-empty-log">Commentary will appear here when the match starts.</li>';
}
function resetCricketGame(){
  stopRealtimeGameLoop();
  gameRunIntent=false;gamePlayerLane=68;gamePlayerStep=0;
  let player=$('gamePlayer').value||gameState.player||chosen[0];
  let userBowler=$('gameOwnBowler').value,opponentCountry=$('gameOpponentCountry').value;
  let opponentBatter=$('gameOpponentBatter').value,bowler=$('gameBowler').value;
  gameState={player,userBowler,opponentCountry,opponentBatter,bowler,currentBatter:player,innings:1,runs:0,wickets:0,balls:0,active:false,phase:'ready',firstInnings:null,history:[],message:`${player} (${players[player]?.team||'your team'}) will face ${bowler} from ${opponentCountry}. The CPU bats second.`};
  renderGameState();
  refreshPhotos([player,userBowler,opponentBatter,bowler]);
}
function startCricketGame(){
  stopRealtimeGameLoop();
  gameRunIntent=false;gamePlayerLane=68;gamePlayerStep=0;
  let player=$('gamePlayer').value;
  let userBowler=$('gameOwnBowler').value,opponentCountry=$('gameOpponentCountry').value;
  let opponentBatter=$('gameOpponentBatter').value,bowler=$('gameBowler').value;
  if(!players[player]){toast('Choose a player before starting the game');return}
  let homeTeam=players[player].team;
  if(!gameBowlerNames(homeTeam).includes(userBowler)){toast('Choose a bowler from your selected country');return}
  if(!opponentCountry||opponentCountry===homeTeam){toast('Choose an opponent country different from your team');return}
  if(!gameBatterNames(opponentCountry).includes(opponentBatter)){toast('Choose an opponent batter from the selected country');return}
  if(!gameBowlerNames(opponentCountry).includes(bowler)){toast('Choose an opponent bowler from the selected country');return}
  gameState={player,userBowler,opponentCountry,opponentBatter,bowler,currentBatter:player,homeLineup:gameLineup(homeTeam,player),awayLineup:gameLineup(opponentCountry,opponentBatter),innings:1,runs:0,wickets:0,balls:0,active:true,phase:'user-batting',firstInnings:null,history:[],message:`${homeTeam} bat first. ${player} faces ${bowler} for ${opponentCountry}.`};
  refreshPhotos([player,userBowler,opponentBatter,bowler]);
  renderGameState();
  startRealtimeGameLoop();
}
function playGameShot(shot){
  if(!GAME_SHOTS.includes(shot)||!gameState.active||gameState.innings!==1)return;
  selectGameIntent(shot);
  let state=gameState.ballDelivery;
  if(!state){gameState.queuedShot=shot;$('gameLiveMessage').textContent=`${GAME_SHOT_LABELS[shot]} queued for the next delivery.`;return}
  if(state.swung)return;
  state.shotIntent=shot;
  let progress=(performance.now()-state.startedAt)/state.duration;
  if(progress<.77){state.autoSwing=true;$('gameLiveMessage').textContent=`${GAME_SHOT_LABELS[shot]} selected — the bat will meet the ball at the crease.`;return}
  swingCricketGame(shot);
}
function playGameDelivery(deliveryId){
  if(!gameState.active||gameState.innings!==2||!GAME_DELIVERIES[deliveryId])return;
  let target=gameState.firstInnings.runs+1;
  let intent=chooseCpuIntent(gameState.currentBatter,target);
  let requiredPressure=gameClamp((target-gameState.runs)/(Math.max(1,GAME_OVERS*6-gameState.balls)*.25),0,.14);
  let outcome=resolveGameOutcome(intent,gameState.userBowler,GAME_DELIVERIES[deliveryId],requiredPressure);
  let description=outcome.wicket
    ?`WICKET! ${gameState.userBowler} traps ${gameState.currentBatter} with a ${GAME_DELIVERIES[deliveryId].label.toLowerCase()}.`
    :outcome.runs===6?`SIX! ${gameState.currentBatter} clears the rope off ${gameState.userBowler}.`
      :outcome.runs===4?`FOUR! ${gameState.opponentCountry} find the boundary.`
        :outcome.runs===0?`${gameState.userBowler} beats the bat with a ${GAME_DELIVERIES[deliveryId].label.toLowerCase()}.`
          :`${gameState.currentBatter} takes ${outcome.runs} run${outcome.runs===1?'':'s'} off ${gameState.userBowler}'s ${GAME_DELIVERIES[deliveryId].label.toLowerCase()}.`;
  recordGameBall(outcome,description,intent);
}
function recordGameBall(outcome,description,intent){
  gameRunIntent=false;
  let ballNumber=gameState.balls+1,over=`I${gameState.innings} ${Math.floor((ballNumber-1)/6)}.${(ballNumber-1)%6+1}`;
  if(outcome.wicket)gameState.wickets++;
  else gameState.runs+=outcome.runs;
  gameState.balls++;
  gameState.history.unshift({over,description,wicket:outcome.wicket,runs:outcome.runs,intent,innings:gameState.innings});
  let lineup=gameState.innings===1?gameState.homeLineup:gameState.awayLineup;
  if(outcome.wicket&&gameState.wickets<10)gameState.currentBatter=lineup[gameState.wickets]||gameState.currentBatter;
  if(gameState.innings===1&&(gameState.wickets>=10||gameState.balls>=GAME_OVERS*6)){
    gameState.firstInnings={runs:gameState.runs,wickets:gameState.wickets,balls:gameState.balls};
    gameState.active=false;
    gameState.phase='innings-break';
    gameState.message=`${players[gameState.player].team} finish on ${gameState.runs}/${gameState.wickets}. Target: ${gameState.runs+1}. Start the CPU chase.`;
  }else if(gameState.innings===2&&(gameState.runs>=gameState.firstInnings.runs+1||gameState.wickets>=10||gameState.balls>=GAME_OVERS*6)){
    finishCricketMatch();
  }else gameState.message=description;
  renderGameState();
  let fieldBatter=$('pageGame').querySelector('.game-field-batter');
  fieldBatter.classList.remove('game-running');
  if(outcome.runs>0){void fieldBatter.offsetWidth;fieldBatter.classList.add('game-running');clearTimeout(fieldBatter.runTimer);fieldBatter.runTimer=setTimeout(()=>fieldBatter.classList.remove('game-running'),760)}
  let ball=$('gameBall'),arena=$('pageGame').querySelector('.game-arena');
  ball.classList.remove('game-ball-hit','game-ball-out','game-ball-dot');ball.style.animation='';
  void arena.offsetWidth;
  ball.classList.add(outcome.wicket?'game-ball-out':outcome.runs?'game-ball-hit':'game-ball-dot');
  let pop=$('gameResultPop'),resultLabel=outcome.wicket?'WICKET':outcome.runs===6?'SIX!':outcome.runs===4?'FOUR!':outcome.runs===0?'DOT BALL':`+${outcome.runs} RUN${outcome.runs===1?'':'S'}`;
  pop.textContent=resultLabel;pop.className=`game-result-pop show ${outcome.wicket?'is-wicket':outcome.runs>=4?'is-boundary':''}`;
  clearTimeout(pop.dismissTimer);pop.dismissTimer=setTimeout(()=>pop.classList.remove('show'),1050);
  if(gameState.active)scheduleRealtimeDelivery(850);
}
function startCpuInnings(){
  if(gameState.phase!=='innings-break'||!gameState.firstInnings)return;
  gameState.innings=2;
  gameState.currentBatter=gameState.opponentBatter;
  gameState.runs=0;
  gameState.wickets=0;
  gameState.balls=0;
  gameState.active=true;
  gameState.phase='cpu-batting';
  gameState.message=`${gameState.opponentCountry} need ${gameState.firstInnings.runs+1} to win. Choose a delivery to bowl to ${gameState.opponentBatter}.`;
  renderGameState();
  refreshPhotos([gameState.opponentBatter,gameState.userBowler]);
  startRealtimeGameLoop();
}
function finishCricketMatch(){
  gameState.active=false;
  gameState.phase='finished';
  let target=gameState.firstInnings.runs+1;
  if(gameState.runs>=target){
    let wicketsRemaining=Math.max(0,10-gameState.wickets);
    gameState.message=`${gameState.opponentCountry} win by ${wicketsRemaining} wicket${wicketsRemaining===1?'':'s'}! ${gameState.opponentBatter}'s side chased ${target} in ${gameOversText(gameState.balls)} overs.`;
  }else if(gameState.runs===gameState.firstInnings.runs)gameState.message=`Match tied! Both teams finish on ${gameState.runs}.`;
  else gameState.message=`${players[gameState.player].team} win by ${gameState.firstInnings.runs-gameState.runs} run${gameState.firstInnings.runs-gameState.runs===1?'':'s'}! ${gameState.opponentCountry} finish on ${gameState.runs}/${gameState.wickets}.`;
}
function exportPlayerPdf(name,selectedFormat){
  let stats=battingStats(name,selectedFormat),bowl=bowlingStats(name,selectedFormat),recent=recentFor(name,selectedFormat);
  let win=window.open('','_print','width=800,height=900');
  let bio=(players[name]&&players[name].description)?`<p class="print-only"><strong>Profile:</strong> ${escapeHtml(players[name].description)}</p>`:'';
  let content=`
  <html><head><title>Cricfy.iq Player Report — ${name}</title>
  <style>body{font-family:Inter,Arial,sans-serif;color:#000;padding:20px} h1{font-size:20px;margin:0 0 4px} h2{font-size:14px;margin:16px 0 6px;border-bottom:1px solid#ccc;padding-bottom:4px} table{border-collapse:collapse;width:100%;font-size:12px} th,td{border:1px solid#bbb;padding:6px;text-align:left} th{background:#eef} .badge{display:inline-block;background:#0b1526;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;margin-bottom:8px} .muted{color:#666;font-size:11px} .two-col{display:flex;gap:24px} .col{flex:1}</style></head>
  <body>
  <h1>${escapeHtml(name)}<span class="badge">${selectedFormat}</span></h1>
  <div class="two-col">
  <div class="col">${imgHtml(name,'')}</div>
  <div class="col">${bio}<p><strong>Team:</strong> ${escapeHtml(players[name]?.team||'—')}</p><p><strong>Role:</strong> ${escapeHtml(players[name]?.role||'—')}</p></div>
  </div>
  <h2>Batting Statistics</h2>
  <table><tr><th>Matches</th><th>Runs</th><th>Average</th><th>Strike Rate</th><th>Highest</th><th>100s</th><th>50s</th><th>Fours</th><th>Sixes</th></tr>
  <tr><td>${fmt(stats?.matches)}</td><td>${fmt(stats?.runs)}</td><td>${fmt(stats?.average)}</td><td>${fmt(stats?.strikeRate)}</td><td>${fmt(stats?.high)}</td><td>${fmt(stats?.centuries)}</td><td>${fmt(stats?.fifties)}</td><td>${fmt(stats?.fours)}</td><td>${fmt(stats?.sixes)}</td></tr></table>
  ${bowl?`<h2>Bowling Statistics</h2><table><tr><th>Matches</th><th>Balls</th><th>Wickets</th><th>Economy</th><th>Avg</th><th>SR</th><th>Maidens</th></tr><tr><td>${fmt(bowl.bowlingMatches)}</td><td>${fmt(bowl.ballsBowled)}</td><td>${fmt(bowl.wickets)}</td><td>${fmt(bowl.economy)}</td><td>${fmt(bowl.bowlingAverage)}</td><td>${fmt(bowl.bowlingStrikeRate)}</td><td>${fmt(bowl.maidens)}</td></tr></table>`:''}
  <h2>Recent Innings</h2>
  <table><tr><th>Date</th><th>Opponent</th><th>Runs</th><th>Balls</th><th>Status</th></tr>
  ${recent.map(innings=>`<tr><td>${innings.date}</td><td>${escapeHtml(innings.opponent||'—')}</td><td>${innings.runs}${innings.notOut?'*':''}</td><td>${innings.balls}</td><td>${innings.notOut?'Not out':'Out'}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">No recent innings recorded.</td></tr>'}</table>
  <p class="muted">Source: Cricsheet international records · Data through ${CRICFY_CRICSHEET.meta.dataThrough} · Generated ${new Date().toLocaleDateString()}</p>
  <script>window.print();setTimeout(()=>window.close(),500)</script>
  </body></html>`;
  win.document.write(content);
  win.document.close();
  toast('Player report prepared for printing');
}
function exportCsv(names,selectedFormat){
  let header=['Player','Team','Format','Matches','Runs','Average','Strike Rate','Highest','100s','50s','Fours','Sixes','Recent Form','Data Source','Data Through'];
  let rows=names.map(name=>{
    let stats=battingStats(name,selectedFormat),values=[name,players[name].team,selectedFormat,stats?.matches,stats?.runs,stats?.average,stats?.strikeRate,stats?.high,stats?.centuries,stats?.fifties,stats?.fours,stats?.sixes,recentFor(name,selectedFormat).map(innings=>`${innings.date}: ${innings.runs}${innings.notOut?'*':''}`).join(' | '),CRICFY_CRICSHEET.meta.source,CRICFY_CRICSHEET.meta.dataThrough];
    return values.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',');
  });
  let blob=new Blob([[header.join(','),...rows].join('\n')],{type:'text/csv'}),anchor=document.createElement('a');
  anchor.href=URL.createObjectURL(blob);
  anchor.download=`cricfy_${selectedFormat.toLowerCase()}_stats.csv`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
  toast('CSV download started');
}
function openPlayerModal(source='comparison'){$('playerModal').classList.remove('hidden');$('modalSearch').value='';renderModalResults(Object.keys(players));$('modalSearch').focus();$('modalSearchBtn').onclick=()=>searchPlayers($('modalSearch').value);$('modalSearch').onkeydown=e=>{if(e.key==='Enter')searchPlayers(e.target.value)};window.modalSource=source}
function closePlayerModal(){$('playerModal').classList.add('hidden')}
function renderModalResults(names){$('modalResults').innerHTML=names.map(n=>`<div class="modal-player">${imgHtml(n,'')}<div><strong>${flagHtml(players[n].team)} ${n}</strong><small>${players[n].team} · ${players[n].role}</small></div><button class="btn btn-small btn-primary" data-modal-add="${n}">${chosen.includes(n)?'Added':'＋ Add'}</button></div>`).join('')||'<p style="color:#a5bad4;font-size:11px">No results. Try a different name.</p>';refreshPhotos(names);document.querySelectorAll('[data-modal-add]').forEach(b=>b.onclick=()=>addPlayer(b.dataset.modalAdd))}
async function searchPlayers(query){let q=query.trim();if(!q){renderModalResults(Object.keys(players));return}let matches=Object.keys(players).filter(n=>n.toLowerCase().includes(q.toLowerCase()));renderModalResults(matches);try{let url=`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(q+' cricket player')}&srlimit=8&origin=*`;let r=await fetch(url);let j=await r.json();let titles=(j.query.search||[]).map(x=>x.title).filter(t=>!Object.keys(players).some(n=>n.toLowerCase()===t.toLowerCase()));let found=[];for(let title of titles.slice(0,5)){let short=title.replace(/ \(.*\)$/,'');if(!short||found.includes(short))continue;found.push(short);if(!players[short])players[short]={wiki:title,team:'Player profile',role:'Cricket player'}}let combined=[...new Set([...matches,...found])].slice(0,12);renderModalResults(combined)}catch{toast('Online player search unavailable. Showing built-in names.')}}
function addPlayer(name){if(chosen.includes(name)){toast(`${name} is already selected`);return}if(chosen.length>=6){toast('You can compare up to 6 players in this demo');return}chosen.push(name);closePlayerModal();if(window.modalSource==='analysis'){navigate('comparison')}else{navigate('comparison')}toast(`${name} added to comparison`)}
function globalSearch(query){let results=Object.keys(players).filter(n=>n.toLowerCase().includes(query.toLowerCase())).slice(0,6);$('globalResults').innerHTML=results.map(n=>`<div class="search-result" data-global-player="${n}">${imgHtml(n,'')}<div>${flagHtml(players[n].team)} ${n}<small style="display:block;color:#90a6c2;font-size:9px">${players[n].team}</small></div></div>`).join('');$('globalResults').classList.toggle('show',query.trim().length>0);refreshPhotos(results);document.querySelectorAll('[data-global-player]').forEach(x=>x.onclick=()=>{let n=x.dataset.globalPlayer;if(!chosen.includes(n)&&chosen.length<6)chosen.push(n);$('globalSearch').value='';$('globalResults').classList.remove('show');navigate('analysis');$('analysisPlayer').value=n;loadAnalysis()})}
let chatContextPlayer='';
let chatHistory=[];
function chatFindPlayers(question){
  let q=question.toLocaleLowerCase();
  return Object.keys(players).filter(name=>q.includes(name.toLocaleLowerCase())).sort((a,b)=>b.length-a.length).slice(0,3);
}
function chatFormatFor(question){let q=question.toLowerCase();return /\bt20\b|twenty\s*20/.test(q)?'T20':/\bodi\b|one.day/.test(q)?'ODI':/\btest\b/.test(q)?'Test':format}
function chatMetricLine(name,selectedFormat,question=''){
  let bat=battingStats(name,selectedFormat),bowl=bowlingStats(name,selectedFormat);
  if(!bat&&!bowl)return `${name} has no ${selectedFormat} record in this Cricsheet snapshot.`;
  let lines=[`${name} · ${players[name]?.team||'Team unavailable'} · ${selectedFormat}`];
  if(bat)lines.push(`Batting: ${fmt(bat.runs)} runs in ${fmt(bat.matches)} matches, average ${fmt(bat.average)}, strike rate ${fmt(bat.strikeRate)}, highest ${fmt(bat.high)}, ${fmt(bat.centuries)} hundreds and ${fmt(bat.fifties)} fifties.`);
  if(bowl)lines.push(`Bowling: ${fmt(bowl.wickets)} wickets in ${fmt(bowl.bowlingMatches)} matches; economy ${fmt(bowl.economy)}, bowling average ${fmt(bowl.bowlingAverage)}.`);
  if(bat&&/recent|last innings|latest innings/.test(question?.toLowerCase?.()||'')){let recent=bat.recent||[];lines.push(recent.length?`Recent innings: ${recent.map(entry=>`${entry.date} ${entry.runs}${entry.notOut?'*':''} vs ${entry.opponent}`).join('; ')}.`:'No recent innings are available in this snapshot.')}
  lines.push(`Source snapshot through ${CRICFY_CRICSHEET.meta.dataThrough}; totals only include matches covered by Cricsheet.`);
  return lines.join('\n');
}
function cricfyChatAnswer(question){
  let q=question.toLowerCase(),names=chatFindPlayers(question),selectedFormat=chatFormatFor(question);
  if(!names.length&&chatContextPlayer&&/\b(he|she|they|his|her|their|that player|same player|average|strike rate|recent form)\b/.test(q))names=[chatContextPlayer];
  if(names.length>=2&&/\b(compare|versus|\bvs\b|difference|better)\b/.test(q)){
    let [a,b]=names,sa=battingStats(a,selectedFormat),sb=battingStats(b,selectedFormat);
    chatContextPlayer=a;
    if(!sa||!sb)return `I can compare ${a} and ${b} when both have a ${selectedFormat} batting record in the snapshot.`;
    let metric=/strike/.test(q)?'strikeRate':/average|avg/.test(q)?'average':'runs',label={strikeRate:'strike rate',average:'average',runs:'runs'}[metric];
    return `${a} vs ${b} in ${selectedFormat}:\n• ${a}: ${fmt(sa[metric])} ${label}\n• ${b}: ${fmt(sb[metric])} ${label}\nThese are recorded source totals, not a prediction of who is better overall.`;
  }
  if(names.length){let name=names[0];chatContextPlayer=name;return chatMetricLine(name,selectedFormat,question)}
  if(/\b(game|play|shot|batting challenge|five.over|five over|innings|chase)\b/.test(q))return 'Open Play Game in the menu, choose your batter, your bowler, and an opposing team, then press Start match. Pick one of the six shot buttons for each ball. The match has two innings of up to five overs each; after your innings, start the CPU chase. The AI outcome uses the batter, bowler, shot or delivery choice, and player data.';
  if(/\b(strike rate|sr)\b/.test(q))return 'Batting strike rate is runs scored per 100 balls faced. For example, 150 means 150 runs per 100 balls. Cricfy calculates it from the recorded Cricsheet innings in the selected format.';
  if(/\b(average|batting average|bowling average)\b/.test(q))return /bowling/.test(q)?'Bowling average is runs conceded per wicket: runs conceded divided by wickets taken. A lower value usually means fewer runs were conceded per wicket.':'Batting average is runs scored divided by times out. Not-outs do not count as dismissals, so average is not simply runs divided by matches.';
  if(/\b(economy|economy rate)\b/.test(q))return 'Bowling economy is the average runs conceded per over. Lower economy means fewer runs conceded per over in the recorded matches.';
  if(/\b(wicket|dismissal|out)\b/.test(q)&&/cricket|mean|what is|how/.test(q))return 'A wicket means a batter is dismissed. Common ways include being bowled, caught, run out, LBW, or stumped. In Cricfy’s five-over game, a wicket ends that batter’s turn and the next batter comes in.';
  if(/\b(100|century|hundred|50|fifty|half.century)\b/.test(q))return 'A century is a batter scoring 100 or more runs in one innings. A half-century is 50 or more. Cricfy’s 100s and 50s count those recorded innings in the selected format.';
  if(/\b(prediction|forecast|predict|machine learning|model)\b/.test(q))return 'The Prediction page provides an illustrative recent-form estimate based on a player’s two latest recorded innings, with optional heuristic adjustments. It is a prototype baseline, not a trained model or a guarantee of a future score.';
  if(/\b(data|source|cricsheet|espn|coverage|missing|snapshot)\b/.test(q))return `Cricfy’s player statistics come from Cricsheet international Test, ODI and T20 ball-by-ball records, matched using Cricsheet’s player register. The current snapshot covers matches through ${CRICFY_CRICSHEET.meta.dataThrough}; it is not a complete career feed, and unavailable records appear as —. It is not a direct ESPNcricinfo feed.`;
  if(/\b(compare|comparison)\b/.test(q))return 'Open Player Comparison, select players, and choose Test, ODI, or T20. Cricfy compares recorded runs, average, strike rate, highest score, and recent innings. You can compare up to six players.';
  if(/\b(find|search|look up|player directory|players)\b/.test(q))return 'Use the Find a player box in the header, or open Players to browse and filter the directory. Open Player Analysis to see one player’s statistics, or Player Comparison to compare several.';
  if(/\b(live|fixture|score|match schedule|upcoming)\b/.test(q))return 'Open Live & Fixtures from the menu for live scores and upcoming schedules. Availability depends on the configured cricket data provider and the matches it returns.';
  if(/\b(hello|hi|hey|help|what can you do)\b/.test(q))return 'I can look up a named player’s batting and bowling figures in this snapshot, explain cricket statistics and terms, and guide you through the game, comparison, predictions, directory, and live pages. Try asking “Virat Kohli T20 stats” or “What is economy rate?”';
  return 'I can help with Cricfy, cricket rules and terms, or player statistics in this site’s Cricsheet snapshot. Try a question like “KL Rahul ODI stats”, “What is strike rate?”, or “How do I play the game?” I may not know unrelated or live-updated facts.';
}
function chatAddMessage(text,kind){let row=document.createElement('div'),bubble=document.createElement('p');row.className=`chat-message ${kind}-message`;bubble.textContent=text;if(kind==='assistant'){let avatar=document.createElement('span');avatar.className='chat-avatar';avatar.setAttribute('aria-hidden','true');avatar.textContent='✦';row.append(avatar)}row.append(bubble);$('chatMessages').append(row);$('chatMessages').scrollTop=$('chatMessages').scrollHeight}
async function chatSubmit(question){
  let value=question.trim();if(!value)return;
  $('chatSuggestions').classList.add('hidden');chatAddMessage(value,'user');chatHistory.push({role:'user',content:value});chatAddMessage('Thinking…','assistant');
  let context=`Current Cricfy player-data snapshot through ${CRICFY_CRICSHEET.meta.dataThrough}. Source: Cricsheet international Test, ODI and T20 records; not complete career totals. `;
  let names=chatFindPlayers(value),selectedFormat=chatFormatFor(value);
  if(names.length)context+=names.map(name=>chatMetricLine(name,selectedFormat,value)).join('\n\n');
  try{
    let requestMessages=chatHistory.slice(-8).map(message=>({role:message.role,content:message.content.slice(-1400)}));
    let response=await fetch(cricfyApiUrl('/api/chat'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:requestMessages,context:context.slice(0,5000)})});
    let payload=await response.json();
    if(!response.ok||!payload.ok)throw new Error(payload.message||'AI chat is unavailable.');
    let pending=$('chatMessages').querySelectorAll('.assistant-message');pending[pending.length-1]?.remove();
    chatHistory.push({role:'assistant',content:payload.answer});chatAddMessage(payload.answer,'assistant');
  }catch(error){
    let pending=$('chatMessages').querySelectorAll('.assistant-message');pending[pending.length-1]?.remove();
    let fallback=cricfyChatAnswer(value),unconfigured=/not configured|failed to fetch|networkerror/i.test(error.message||'');
    let answer=unconfigured?fallback:`${fallback}\n\nAI service note: ${error.message}`;
    chatHistory.push({role:'assistant',content:answer});chatAddMessage(answer,'assistant');
  }
}
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.page));$('mobileToggle').onclick=()=>$('navLinks').classList.toggle('open');$('globalSearch').oninput=e=>globalSearch(e.target.value);$('globalSearch').onkeydown=e=>{if(e.key==='Enter'&&e.target.value.trim()){let exact=Object.keys(players).find(n=>n.toLowerCase()===e.target.value.trim().toLowerCase());if(exact){if(!chosen.includes(exact)&&chosen.length<6)chosen.push(exact);navigate('analysis');$('analysisPlayer').value=exact;loadAnalysis()}else{openPlayerModal();$('modalSearch').value=e.target.value;searchPlayers(e.target.value)}}};document.addEventListener('click',e=>{if(!e.target.closest('.top-search'))$('globalResults').classList.remove('show');let goto=e.target.closest('[data-goto]');if(goto)navigate(goto.dataset.goto)});$('closeModal').onclick=closePlayerModal;$('playerModal').onclick=e=>{if(e.target===$('playerModal'))closePlayerModal()};
$('copyrightYear').textContent=CURRENT_YEAR;
$('themeToggle').onclick=toggleTheme;
initTheme();
$('chatLauncher').onclick=()=>{let open=$('chatPanel').classList.toggle('hidden')===false;$('chatLauncher').setAttribute('aria-expanded',String(open));if(open)$('chatInput').focus()};
$('chatModeNote').textContent='Built-in cricket help · checking AI availability…';
fetch(cricfyApiUrl('/api/chat-status'),{cache:'no-store'}).then(response=>response.json()).then(payload=>{$('chatModeNote').textContent=payload.configured?'AI chat connected · answers use your Cricfy data context.':'Built-in answers active · start start_cricfy.ps1 to enable general AI chat.'}).catch(()=>{$('chatModeNote').textContent='Built-in cricket help · start start_cricfy.ps1 to connect the AI service.'});
$('chatClose').onclick=()=>{$('chatPanel').classList.add('hidden');$('chatLauncher').setAttribute('aria-expanded','false');$('chatLauncher').focus()};
$('chatForm').onsubmit=event=>{event.preventDefault();let input=$('chatInput'),question=input.value;input.value='';chatSubmit(question);input.focus()};
$('chatSuggestions').onclick=event=>{let prompt=event.target.closest('button');if(prompt)chatSubmit(prompt.textContent)};
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('chatPanel').classList.contains('hidden')){$('chatPanel').classList.add('hidden');$('chatLauncher').setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',handleGameKeyboard);
startCricsheetVersionMonitor();
applyComparisonUrl();
// Open Home by default; shared comparison links still open the selected players.
navigate(new URLSearchParams(location.search).has('players')?'comparison':'home');
