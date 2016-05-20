# NOAA Weather Readings

This repository provides downloadable code 
for the book, "Data Visualization Toolkit"; see [DataVisualizationToolkit.com](http://www.datavisualizationtoolkit.com).

These example programs are licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.<br/>
<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png"/></a>

## To Run

This is a rails app that runs on Ruby 2.2.3.  Clone the repo and run:

* `bundle install`
* `bundle exec rake db:create db:migrate`

## Checkpoints

* Ch 3, "Working with Time Series Data"
  - Initial setup ([9c007a0](https://github.com/DataVizToolkit/weather/tree/ch03.1))
  - Weather Reading + Weather Station import ([c7d8553](https://github.com/DataVizToolkit/weather/tree/ch03.2))
  - Line graph ([f047c76](https://github.com/DataVizToolkit/weather/tree/ch03.3))
  - Chapter 3 Tweak 1 ([97e5bef](https://github.com/DataVizToolkit/weather/tree/ch03.4))
  - Chapter 3 Tweak 2 ([d1e84fa](https://github.com/DataVizToolkit/weather/tree/ch03.5))
  - Chapter 3 Tweak 3 ([8531817](https://github.com/DataVizToolkit/weather/tree/ch03.6))
  - Chapter 3 Tweak 4 ([6cfb627](https://github.com/DataVizToolkit/weather/tree/ch03.7))
  - Chapter 3 Tweak 5 ([582d026](https://github.com/DataVizToolkit/weather/tree/ch03.8))
* Ch 4, "Working with Large Datasets"
  - Import large file via HTTP (uses git-lfs) ([051d179](https://github.com/DataVizToolkit/weather/tree/ch04.1))
  - Benchmarking ([f0b4039](https://github.com/DataVizToolkit/weather/tree/ch04.2))
  - Scopes in the WeatherReading model ([56d207b](https://github.com/DataVizToolkit/weather/tree/ch04.3))
  - Add WeatherReading index ([fe7c719](https://github.com/DataVizToolkit/weather/tree/ch04.4))
* Ch 5, "Window Functions, Subqueries, and Common Table Expression"
  - lead() window function in console (not in app)
  - subquery, CTE in console (not in app)
  - CTE + heatmap ([fd39ec6](https://github.com/DataVizToolkit/weather/tree/ch05.1))
* Ch 10, "Making Maps with Leaflet and Rails"
  - Weather stations map ([ff628eb](https://github.com/DataVizToolkit/weather/tree/ch10.1))
