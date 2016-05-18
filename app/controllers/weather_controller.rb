class WeatherController < ApplicationController
  def index; end
  def data
    readings = WeatherReading.
      joins(:weather_station).
      where(:reading_type => "TMAX").
      where("weather_stations.name = 'MILAN'").
      order("reading_type, reading_date").
      select("weather_readings.id, reading_date, reading_type, reading_value, source_flag, latitude, longitude, elevation, name")
    render :json => { :readings => readings }
  end
end
