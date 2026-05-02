export const categories = ["Aile", "Porte", "Pare brise", "Vitre","Capot","Poigneé","Pare choc"];
export const manifacturers = ["AUDI", "VOLKSWAGEN", "RENAULT", "MERCEDES", "FIAT", "BMW", "FORD", "CITROËN", "TOYOTA", "VOLVO", "PEUGEOT", "HONDA", "KIA", "DACIA", "OPEL", "MAZDA", "SEAT", "SKODA", "HYUNDAI", "MITSUBISHI", "NISSAN"];
export const manifacturerWithModels = {
	AUDI: ['A1', 'A2', 'A3', 'A3 limousine', 'S3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron']
	, VOLKSWAGEN: ['up', 'Polo', 'Golf', 'Golf GTI', 'Golf ,ian', 'Golf Sportsvan', 'Beetle', 'Kaefer', 'Scirocco', 'Jetta', 'CC', 'Passat', 'Passat ,iant', 'Eos', 'Phaeton', 'Touran', 'Sharan', 'Tiguan', 'Tiguan Allspace', 'Touareg', 'T-Roc', 'Caddy', 'Amarok', 'Arteon', 'Multivan', 'California', 'Crafter', 'Transporter', 'Lupo', 'XL1 ']
	, RENAULT: ['Captur', 'Clio', 'Espace', 'Grand Scénic', 'Kadjar', 'Kangoo', 'Koleos', 'Laguna', 'Master', 'Megane', 'Modus', 'Scenic', 'Talisman', 'Trafic', 'Twingo', 'Vel-satis', 'Wind', 'Zoe']
	, MERCEDES: ['A-Klasse', 'A-Klasse Limousine', 'B-Klasse', 'C-Klasse', 'AMG GT', 'CL-Klasse', 'CLA', 'CLS', 'E-Klasse', 'G-Klasse', 'GL-Klasse', 'GLA', 'GLC', 'GLE', 'GLK-Klasse', 'GLS	', 'R-Klasse', 'S-Klasse', 'SL', '300 SL', 'SLC', 'SLK', 'SLR McLaren', 'V-Klasse', 'X-Klasse', 'M-Klasse', 'MLC', 'EQC', 'Vito', 'Viano']
	, FIAT: ['Punto', 'Qubo', '500L', 'Fullback', 'Sedici', '124 Spider', '500', 'Bravo', '500X', 'Freemont', 'Tipo', 'Panda', 'Doblo', 'Ducato', 'Stilo']
	, BMW: ['1er', '2er', '2er Active Tourer', '2er Gran Tourer', '3er', '3er Gran Turismo', '4er', '5er', '6er', '7er', '8er', 'M2', 'M3', 'M4', 'M5', 'Z3', 'Z4', 'Z8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6']
	, FORD: ['Ka', 'Fiesta', 'Focus', 'Mondeo', 'Mustang', 'GT', 'Galaxy', 'S-MAX', 'B-MAX', 'C-MAX | Grand C-MAX', 'Ecosport', 'Edge', 'Kuga', 'Ranger', 'Transit', 'Tourneo']
	, CITROËN: ['C-Zero', 'C1', 'C3', 'C3 Picasso', 'C3 Aircross', 'DS5', 'C4', 'C4 Picasso / Spacetourer', 'C4 Aircross', 'C4 Cactus', 'C5', 'C5 Aircross', 'C6', 'C8', 'E-Mehari', 'C-Crosser', 'Berlingo', 'Nemo Multispace', 'Spacetourer']
	, TOYOTA: ['Auris', 'Avensis', 'Aygo', 'C-HR', 'Camry', 'Cellica', 'Corolla', 'GT86', 'Hilux', 'iQ', 'Land Cruiser', 'Mirai', 'MR2', 'Previa', 'Prius', 'Rav4', 'Urban Cruiser', 'Verso', 'Verso-S', 'Yaris']
	, VOLVO: ['V40', 'V50', 'V60', 'V70', 'S40', 'S60', 'S80', 'S90', 'C30', 'C70', 'XC40', 'XC60', 'XC70', 'XC90', 'Versatillity']
	, PEUGEOT: ['iOn ', '107', '108', '206', '207', '208', '307', '308', '406', '407', '508', '607', '807', 'RCZ', '2008', '3008', '4007', '4008', '5008', 'Bipper', 'Partner', 'Expert', 'Boxer']
	, HONDA: ['Accord', 'Civic', 'Civic Tourer', 'CR-V', 'CR-Z', 'HR-V', 'Insight', 'Jazz', 'Jazz Hybrid']
	, KIA: ['ceed Sportswagon', 'Carnival', 'Sorento', 'Picanto', 'Rio', 'Stonic', 'Venga', 'Soul', 'ceed ', 'Optima', 'Carens', 'Sportage', 'Soul EV', 'Concept Cars', 'Niro', 'Stinger']
	, DACIA: ['Dokker', 'Duster', 'Lodgy', 'Logan', 'Logan MVC', 'Sandero']
	, OPEL: ['Adam', 'Adam Rocks', 'Corsa', 'Karl', 'Astra', 'Astra Sports Tourer', 'GTC', 'Cascada', 'Insignia', 'Insignia OPC', 'Ampera-e', 'Zafira', 'Mokka X', 'Crossland X', 'Grandland X', 'Combo Life', 'Agila', 'Tigra', 'Monza Concept', 'Vectra', 'Antara', 'Meriva', 'Movano']
	, MAZDA: ['MX-5', '2', '3', '5', '6', 'CX-3', 'CX-5', 'CX-7', 'Rx-8']
	, SEAT: ['Mii', 'Arosa', 'Salsa', 'Tango', 'Bolero', 'Formula', 'Cordoba', 'Exeo', 'Altea', 'Ibiza', 'Leon', 'Leon Cupra', 'Leon ST', 'Toledo', 'Arona', 'Tarraco', 'Ateca', 'Alhambra']
	, SKODA: ['Citigo', 'Fabia', 'Fabia Combi', 'Rapid', 'Rapid Spaceback', 'Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Yeti', 'Roomster', 'Praktik']
	, HYUNDAI: ['i10', 'i20', 'ix20', 'i30', 'i30cw', 'i40', 'i40cw', 'Veloster', 'ix55', 'Kona', 'Nexo', 'Santa Fe', 'Genesis', 'Genesis Coupé', 'ix35 | Tucson', 'H-1 Travel', 'H-1 Cargo']
	, MITSUBISHI: ['ASX', 'Colt', 'I-MiEV', 'L200', 'Lancer', 'Lancer Evolution', 'Outlander', 'Pajero', 'Space Star']
	, NISSAN: ['Pixo', 'Micra', 'Pulsar', 'Qashqai', 'Murano', 'Pathfinder', 'Na,a', 'Note', 'Juke', 'X-Trail', 'Leaf', '370Z', 'GT-R', 'Maxima', 'Evalia']
};


