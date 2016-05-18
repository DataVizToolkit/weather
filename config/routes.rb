Rails.application.routes.draw do
  get 'weather/index'
  get 'weather/data', :defaults => { :format => 'json' }

  get 'weather/heatmap'
  get 'weather/heatmap_data', :defaults => { :format => 'json' }
end
