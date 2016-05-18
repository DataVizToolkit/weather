class AddIndexToWeatherReadings < ActiveRecord::Migration
  def change
    # add_index :weather_readings, :reading_date
    # add_index :weather_readings, :reading_type
    add_index :weather_readings, [:reading_date, :reading_type]
  end
end
