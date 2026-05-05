#check for spaces and return list if known exist
def listCreate(word):
    if ' ' in list(word):
        print('This was not a single word.\n')
        return list(word)
    else:
        return list(word)


def anagram():
    word = input('Please input the first word.\n')
    list1 = listCreate(word)
    word = input('Please input the second word to check.\n')
    list2 = listCreate(word)
    if not list1 or not list2:
        print('empty input... exiting')
        exit
    elif len(list1) != len(list2):
        print('These words are not anagrams.\n')
    else:
        list1.sort()
        list2.sort()
        if list1 == list2:
            print('These words are anagrams')
        else:
            print('these words are not anagrams')

    return

anagram()