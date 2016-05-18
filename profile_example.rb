require 'ruby-prof'
require 'date'

RubyProf.start

str = "17630104"
date = Date.parse(str)

result = RubyProf.stop
printer = RubyProf::GraphPrinter.new(result)
printer.print(STDOUT)
