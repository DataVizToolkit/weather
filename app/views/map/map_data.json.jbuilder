json.type "FeatureCollection"
json.features @stations do |station|
  json.type "Feature"
  json.properties do
    json.set! "marker-color", "#9932CC"
    json.set! "marker-symbol", "circle"
    json.set! "marker-size", "small"
    json.title "#{station['station_id']} (#{station['name']})"
  end
  json.geometry do
    json.type "Point"
    json.coordinates [station['longitude'], station['latitude']]
  end
end
