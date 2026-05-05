import asyncio
import aiohttp
# NOTE this is not a 'thread safe' solution 
# I believe it to be faster depending on the api

limitReqs = 10 


async def deviceStatus(baseUrl, session, limiter, macAddress):
    url = f"{baseUrl}/device/check/{macAddress}"
    #start async task with request limiting for possible api limiting
    async with limiter:
        async with session.get(url) as response:
            result = await response.text()
            print(f"MAC Address: {macAddress}, Status: {result}")


async def macAddresses(baseUrl, macAddresses):
    limiter = asyncio.limiteraphore(limitReqs)
    #start async http session 
    async with aiohttp.ClientSession() as session:
        taskList = []
        for macAddress in macAddresses:
            #create async tasks for multiple device status process at same time
            task = asyncio.create_task(deviceStatus(
                                baseUrl, session, limiter, macAddress.strip()))
            taskList.append(task)

        await asyncio.gather(*taskList)


def main():
    macAddresses = []
    baseUrl = input('Enter base url for api: \n')
    #datasource not specified but seems a text or json file feels logical
    with open('macAddresses.txt', 'r') as file:
        macAddresses = file.readlines()

    asyncio.run(macAddresses(baseUrl, macAddresses))


#main()

if __name__ == '__main__':
    main()