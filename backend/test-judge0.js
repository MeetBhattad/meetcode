const axios = require("axios");

const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",

    params: {
        base64_encoded: "false"
    },

    headers: {
        "x-rapidapi-key": process.env.JUDGE0_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
    },

    data: {
        submissions: [
            {
                language_id: 54,
                source_code: `
#include <iostream>
using namespace std;

int main() {
    cout << "Judge0 is working!";
    return 0;
}
`
            }
        ]
    }
};

async function test() {
    try {
        console.log("Testing Judge0...");

        const response = await axios.request(options);

        console.log("\nSTATUS:", response.status);
        console.log("RESPONSE:");
        console.log(response.data);

    } catch (error) {

        console.log("\nREQUEST FAILED");

        if (error.response) {
            console.log("HTTP STATUS:", error.response.status);
            console.log("RESPONSE:", error.response.data);
        } else {
            console.log("ERROR:", error.message);
        }
    }
}

test();