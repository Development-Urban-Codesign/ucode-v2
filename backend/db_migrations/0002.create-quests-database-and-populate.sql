drop table if exists quests;
create table quests (id serial primary key, fulfillment integer, content text);
insert into quests (fulfillment, content) values (0,'Schau dir den Planungsraum an und nutze das Linien-Werkzeug, um eine Route einzuzeichnen, die du regelmäßig benutzt, um dich im Planungsgebiet zu bewegen.');
insert into quests (fulfillment, content) values (0,'Markiere mindestens 3 Orte, die durch die aktuelle Planung aufgewertet werden oder welche von einer der drei Varianten profitieren. Nutze die Kommentarfunktion um die Bereiche zu markieren. Erläutere kurz.');
insert into quests (fulfillment, content) values (0,'Markiere nun mindestens 3 Orte, wo du Konfliktpotential durch die Planungsvarianten siehst oder wo noch etwas verbessert werden kann. Bitte beschreibe deine Auswahl.');
insert into quests (fulfillment, content) values (0,'Markiere noch Orte, an welchen du die aktuelle Planung nicht verstehst und wo deiner Meinung nach Klärungsbedarf besteht.');
insert into quests (fulfillment, content) values (0,'Hallo und Willkommen zur Mobilitätsbeteiligung in Mainz. Zum Ausbau des Straßenbahnnetzes soll eine neue Route in Mainz entstehen und es gibt schon jetzt die Möglichkeit Feedback und Ideen zur angedachten Planung einzureichen.');

