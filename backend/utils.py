def sure_float(may_be_number)->float:  
    # function which extracts surely the integer or float inside a string
    # will handle strings like "23m" or "23,5 m" or "23.0 m" correctly
    my_sure_float = "0"
    try:
        my_sure_float = float(may_be_number)
    except:
        may_be_number = may_be_number.strip()
        may_be_number = may_be_number.replace(",", ".")
        may_be_number = may_be_number.replace("'", ".")
        for x in may_be_number:
            if x in "0123456789.":
                my_sure_float = my_sure_float + x
            elif x.isspace():
                break
        my_sure_float = float(my_sure_float)

    return my_sure_float