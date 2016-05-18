class WeatherReading < ActiveRecord::Base
  has_one :weather_station, :foreign_key => 'station_id', :primary_key => 'station'
end
