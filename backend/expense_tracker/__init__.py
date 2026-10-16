import sys

from kanban_board import dependencies, main, models


sys.modules[f"{__name__}.dependencies"] = dependencies
sys.modules[f"{__name__}.main"] = main
sys.modules[f"{__name__}.models"] = models
