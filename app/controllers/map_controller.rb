class MapController < ApplicationController
  layout "map"

  def index
  end
  def map_data
    sql = <<-SQL.strip_heredoc
      SELECT *
      FROM weather_stations
      WHERE station_id IN (
        SELECT DISTINCT station
        FROM weather_readings
        WHERE reading_date < '1837-01-01'
          AND reading_type IN ('TMAX', 'TMIN')
      )
    SQL
    @stations = ActiveRecord::Base.connection.execute(sql)
  end
end
