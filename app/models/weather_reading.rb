class WeatherReading < ActiveRecord::Base
  has_one :weather_station, :foreign_key => 'station_id', :primary_key => 'station'

  scope :temps, -> { where(:reading_type => ["TMAX", "TMIN"]) }
  scope :with_weather_station, -> { joins(:weather_station) }
  scope :with_fields, -> { select("weather_readings.id, reading_date, reading_type, reading_value, source_flag, latitude, longitude, elevation, name") }
  scope :for_station, ->(station) { with_weather_station.with_fields.where("weather_stations.name = ?", station) }
  scope :sorted, -> { order("reading_type, reading_date") }
  scope :for_year, ->(year) { where(:reading_date => Date.new(year, 1, 1)..Date.new(year+1, 1, 1)) }

  def self.heatmap(station)
    sql = <<-SQL.strip_heredoc
      WITH days AS (
        SELECT dt
        FROM generate_series('18360101'::timestamp, '18361231'::timestamp, '1 day') AS dt
      ), temperature_readings AS (
        SELECT id, reading_date, reading_value
        FROM weather_readings
        WHERE reading_type = 'TMAX'
          AND station = '#{station}'
        ORDER BY 3, 2
      )
      SELECT tr.*
      FROM temperature_readings tr
      RIGHT JOIN days ON reading_date >= days.dt AND reading_date <= days.dt;
    SQL
    connection.execute(sql)
  end
end
