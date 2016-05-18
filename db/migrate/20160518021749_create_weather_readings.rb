class CreateWeatherReadings < ActiveRecord::Migration
  def change
    create_table :weather_readings do |t|
      t.string :station
      t.date :reading_date
      t.string :reading_type
      t.integer :reading_value
      t.string :measurement_flag
      t.string :quality_flag
      t.string :source_flag
      t.integer :observation_time

      t.timestamps null: false
    end
  end
end
