require 'csv'

namespace :db do
  namespace :seed do
    desc "Import NOAA weather CSV"
    task :import_noaa_weather => :environment do

      filename = File.join(Rails.root, 'db', 'data_files', '1836.csv')
      CSV.foreach(filename, :headers => false) do |row|
        puts $. if $. % 10000 == 0
        date_parts = row[1].match(/(\d{4})(\d{2})(\d{2})/)
        date = Date.civil(date_parts[1].to_i, date_parts[2].to_i, date_parts[3].to_i)
        data = {
          :station          => row[0],
          :reading_date     => date,
          :reading_type     => row[2],
          :reading_value    => Integer(row[3]),
          :measurement_flag => row[4],
          :quality_flag     => row[5],
          :source_flag      => row[6],
          :observation_time => row[7]
        }
        WeatherReading.create(data)
      end
    end

    desc "Import NOAA weather station data"
    task :import_noaa_stations => :environment do
      def safe_string(str)
        str.strip!
        str.empty? ? nil : str
      end

      filename = File.join(Rails.root, 'db', 'data_files', 'ghcnd-stations.txt')
      File.open(filename, "r") do |f|
        f.each_with_index do |line, index|
          puts index if index > 0 && index % 10000 == 0
          data = {
            :station_id => line[0..10],
            :latitude   => safe_string(line[11..19]),
            :longitude  => safe_string(line[20..29]),
            :elevation  => safe_string(line[30..36]),
            :state      => safe_string(line[38..39]),
            :name       => safe_string(line[41..70]),
            :gsn_flag   => safe_string(line[72..74]),
            :hcn_flag   => safe_string(line[76..78]),
            :wmo_id     => safe_string(line[80..84])
          }
          WeatherStation.create(data)
        end
      end
    end

    desc "Fetch and load a remote compressed file"
    task :import_noaa_weather_via_http => :environment do
      require 'csv'
      require 'net/http'

      CONN = ActiveRecord::Base.connection
      bulk_insert = lambda { |rows|
        sql = <<-SQL.strip_heredoc
        INSERT INTO weather_readings (station, reading_date, reading_type,
        reading_value, measurement_flag, quality_flag, source_flag,
        observation_time, created_at, updated_at)
        VALUES #{rows.join(',')}
        SQL
        CONN.execute(sql)
      }
      uri  = URI("http://www1.ncdc.noaa.gov/pub/data/ghcn/daily/by_year/1940.csv.gz")
      gzip = Net::HTTP.get(uri)
      data = ActiveSupport::Gzip.decompress(gzip)
      rows = []
      n    = 0
      CSV.parse(data) do |row|
        station          = CONN.quote(row[0])
        date_parts       = row[1].match(/(\d{4})(\d{2})(\d{2})/)
        reading_date     = CONN.quote("#{date_parts[1]}-#{date_parts[2]}-#{date_parts[3]}")
        reading_type     = CONN.quote(row[2])
        reading_value    = Integer(row[3])
        measurement_flag = CONN.quote(row[4])
        quality_flag     = CONN.quote(row[5])
        source_flag      = CONN.quote(row[6])
        observation_time = row[7].nil? ? 'NULL' : row[7]
        fields = "(#{station}, #{reading_date}, #{reading_type}, "
        fields += "#{reading_value}, #{measurement_flag}, "
        fields += "#{quality_flag}, #{source_flag}, "
        fields += "#{observation_time}, NOW(), NOW())"
        rows << fields
        n += 1
        if rows.count % 10000 == 0
          bulk_insert.call(rows)
          rows = []
          puts "...#{n} rows added"
        end
      end
      bulk_insert.call(rows)
      puts "...#{n} rows added"
    end
  end
end
