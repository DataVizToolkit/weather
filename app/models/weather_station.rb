class WeatherStation < ActiveRecord::Base
  belongs_to :weather_reading
end
