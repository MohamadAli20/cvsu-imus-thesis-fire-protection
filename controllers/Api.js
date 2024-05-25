class Api{
    fetchFireData(req, res){
        console.log(req.params.name_of_place);

        const responseData = [
            { name: "Imus", data: "This is data" },
            { name: "Imus", data: "This is data" },
            { name: "Imus", data: "This is data" }
        ]
        res.json(responseData)
    }
}

module.exports = new Api;