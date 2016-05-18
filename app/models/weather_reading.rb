class WeatherReading < ActiveRecord::Base
  has_one :weather_station, :foreign_key => 'station_id', :primary_key => 'station'

  scope :temps, -> { where(:reading_type => ["TMAX", "TMIN"]) }
  scope :with_weather_station, -> { joins(:weather_station) }
  scope :with_fields, -> { select("weather_readings.id, reading_date, reading_type, reading_value, source_flag, latitude, longitude, elevation, name") }
  scope :for_station, ->(station) { with_weather_station.with_fields.where("weather_stations.name = ?", station) }
  scope :sorted, -> { order("reading_type, reading_date") }
  scope :for_year, ->(year) { where(:reading_date => Date.new(year, 1, 1)..Date.new(year+1, 1, 1)) }
end
