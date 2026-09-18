// Exact underscore bounds measured on scheda-adesione-originale.pdf (PDF points,
// top-left origin). Keep labels and punctuation outside these rectangles.
const rows=[
 [121.79,[['company',74.06,557.03]]],
 [140.15,[['legal_city',111.58,226.11],['legal_province',231.52,251.35],['legal_street',271.72,421.19],['legal_number',432.07,456.95],['legal_zip',476.79,556.55]]],
 [158.39,[['office_city',126.34,235.89],['office_province',238.96,258.79],['office_street',279.25,423.71],['office_number',434.59,464.38],['office_zip',484.38,554.15]]],
 [176.75,[['tax_code',93.34,267.69],['vat',315.77,554.87]]],
 [195.11,[['phone',50.4,125.09],['fax',141.02,215.73],['email',240.26,379.78],['pec',397.49,556.79]]],
 [213.35,[['representative',232.89,556.79]]],
 [231.71,[['birth_city',73.94,252.98],['birth_province',258.43,278.35],['birth_date',292.85,556.79]]],
 [249.95,[['residence_city',85.7,240.21],['residence_province',245.47,265.39],['residence_street',285.75,460.07],['residence_number',470.98,555.59]]],
 [268.31,[['consultant',193.7,342.88],['consultant_phone',357.34,422],['consultant_email',441.65,556.15]]],
 [397.34,[['employees',358.15,412.78]]],
 [419.54,[['managers',82.08,121.81],['supervisors',177.4,217.35],['clerks',265.5,300.2],['workers',359.98,404.74]]],
 [583.6,[['fee',326.09,375.66]]],
 [620.2,[['place',36,100.68],['date',112.32,196.94]]],
 [644.68,[['signature',351.67,485.98]]],
 [771.67,[['privacyPlace',36,100.74],['privacyDate',112.32,196.88]]],
 [799.75,[['privacySignature',351.67,485.98]]]
];
module.exports=Object.fromEntries(rows.flatMap(([top,fields])=>fields.map(([name,left,right])=>[name,{left,right,top,bottom:top+9.96}])));
