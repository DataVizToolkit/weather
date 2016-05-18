class WeatherController < ApplicationController
  def index; end
  def data
    year     = params[:year] || 1836
    readings = WeatherReading.temps.for_station('MILAN').for_year(year).sorted
    render :json => { :readings => readings }
  end
end
