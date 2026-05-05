
def getSum():
    sumInts = 0

    n = int(input("How many integers will be input?\n"))

    for i in range(0, n):
        if i == 0:
            ints = int(input('What is your first integer?\n'))
            if ints % 2 == 0:
                sumInts += ints
        else:
            ints = int(input('Please enter the next integer.\n'))
            if ints % 2 == 0:
                sumInts += ints

    return(sumInts)

total = getSum()
print(total)