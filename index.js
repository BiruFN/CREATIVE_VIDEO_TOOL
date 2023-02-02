const axios = require("axios");
const fs = require("fs");
const readline = require("readline/promises");

const deviceId = "";
const accountId = "";
const secret = "";

(async ()=>{
    await Menu();
})();

async function Menu() {
    console.clear();
    console.log("利用可能なオプション:");
    console.log("[0] Get VideoID for specific island version");
    console.log("[1] Get VideoID for all island versions");
    console.log("[2] Get VideoID for all islands and all versions");
    console.log("[3] Exit");
    const option = await ReadLine("> ");
    if (option === "0") {
        console.clear();
        const islandCode = await ReadLine("島コードを入力して下さい\n> ");
        const islandVersion = await ReadLine("島バージョンを入力して下さい\n> ");
        const accessToken = await GetAccessToken();
        const islandInfo = await GetIslandInfo(accessToken, `${islandCode}?v=${islandVersion}`);
        console.clear();
        if (islandInfo === "errors.com.epicgames") {
            console.log("島の情報の取得に失敗しました");
            await ReadLine("\nメニューに戻る...\n");
            await Menu();
            return;
        }
        onsole.log(`AccountId: ${islandInfo.accountId}`);
        console.log(`CreatorName: ${islandInfo.creatorName}`);
        console.log(`Mnemonic: ${islandInfo.mnemonic}`);
        console.log(`Title: ${islandInfo.metadata.title}`);
        console.log(`SupportCode: ${islandInfo.metadata.supportCode}`);
        console.log(`Version: ${islandInfo.version}`);
        console.log(`Video_Vuid: ${islandInfo.metadata.video_vuid}`);
        console.log(`Video_Url: ${islandInfo.metadata.video_url}`);
        await KillAccessToken(accessToken);
        await ReadLine("\nメニューに戻る...\n");
        await Menu();
    }
    else if (option === "1") {
        console.clear();
        const islandCode = await ReadLine("島コードを入力して下さい\n> ");
        const accessToken = await GetAccessToken();
        const islandInfo = await GetIslandInfo(accessToken, islandCode);
        console.clear();
        if (islandInfo === "errors.com.epicgames") {
            console.log("島の情報の取得に失敗しました");
            await ReadLine("\nメニューに戻る...\n");
            await Menu();
            return;
        }
        console.log(`AccountId: ${islandInfo.accountId}`);
        console.log(`CreatorName: ${islandInfo.creatorName}`);
        console.log(`Mnemonic: ${islandInfo.mnemonic}`);
        console.log(`Title: ${islandInfo.metadata.title}`);
        console.log(`SupportCode: ${islandInfo.metadata.supportCode}`);
        console.log(`Version: ${islandInfo.version}`);
        let version = Number(islandInfo.version);
        let ver = 0;
        for (let i = 0; i < version; i++) {
            ver++
            const metadata = await GetMetaData(accessToken, `${islandCode}?v=${ver}`);
            console.log("");
            console.log(`Version: ${ver}`);
            console.log(`Video_Vuid: ${metadata.video_vuid}`);
            console.log(`Video_Url: ${metadata.video_url}`);
        }
        await KillToken(accessToken);
        await ReadLine("\nメニューに戻る...\n");
        await Menu();
    }
    else if (option === "2") {
        console.clear();
        const creatorCode = await ReadLine("クリエイターコードを入力して下さい\n> ");
        const accessToken = await GetAccessToken();
        const credentialsToken = await GetCredentialsToken();
        const creatorInfo = await GetCreatorInfo(credentialsToken, creatorCode);
        console.clear();
        if (creatorInfo === "errors.com.epicgames") {
            console.log("クリエイター情報の取得に失敗しました");
            await ReadLine("\nメニューに戻る...\n");
            await Menu();
            return;
        }
        const creatorIsland = await GetCreatorIsland(accessToken, creatorInfo.id);
        if (creatorIsland === "errors.com.epicgames") {
            console.log("公開されている島の取得に失敗しました");
            await ReadLine("\nメニューに戻る...\n");
            await Menu();
            return;
        }
        await KillToken(accessToken);
        for(var value of creatorIsland.links) {
            const accessToken = await GetAccessToken();
            const islandCode = value.linkCode;
            const islandInfo = await GetIslandInfo(accessToken, islandCode);
            console.log("");
            console.log(`Mnemonic: ${islandInfo.mnemonic}`);
            console.log(`Title: ${islandInfo.metadata.title}`);
            console.log(`Version: ${islandInfo.version}`);
            let version = Number(islandInfo.version);
            let ver = 0;
            for (let i = 0; i < version; i++) {
                ver++
                const metadata = await GetMetaData(accessToken, `${islandCode}?v=${ver}`);
                console.log(`v=${ver} / ${metadata.video_vuid} / ${metadata.video_url}`);
            }
            await KillToken(accessToken);
        }
        await ReadLine("\nメニューに戻る...\n");
        await Menu();
    }
    else if (option === "3") {
        return;
    }
    else {
        await Menu();
    }
}

async function ReadLine(text) {
    const readInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const string = await readInterface.question(text);
    readInterface.close();
    return string;
}

async function GetCredentialsToken() {
    try{
        const response = await axios.post("https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token", {
            "grant_type":"client_credentials"
        }, {
            headers: {"Authorization":"Basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=", "Content-Type":"application/x-www-form-urlencoded"}
        });
        return response.data.access_token;
    }
    catch {
        return "errors.com.epicgames";
    }
}

async function GetAccessToken() {
    try{
        const response = await axios.post("https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token", {
            "grant_type":"device_auth", "device_id":deviceId, "account_id":accountId, "secret":secret
        }, {
            headers: {"Authorization":"Basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=", "Content-Type":"application/x-www-form-urlencoded"}
        });
        return response.data.access_token;
    }
    catch {
        return "errors.com.epicgames";
    }
}

async function KillToken(token) {
    try{
        await axios.delete(`https://account-public-service-prod.ol.epicgames.com/account/api/oauth/sessions/kill/${token}`, {
            headers: {"Authorization":`Bearer ${token}`}
        });
        return;
    }
    catch {
        return "errors.com.epicgames";
    }
}

async function GetIslandInfo(accessToken, islandCode) {
    try{
        const response = await axios.get(`https://links-public-service-live.ol.epicgames.com/links/api/fn/mnemonic/${islandCode}`, {
            headers: {"Authorization":`Bearer ${accessToken}`}
        });
        return response.data;
    }
    catch {
        return "errors.com.epicgames";
    }
}

async function GetMetaData(accessToken, islandCode) {
    try{
        const response = await axios.get(`https://links-public-service-live.ol.epicgames.com/links/api/fn/mnemonic/${islandCode}`, {
            headers: {"Authorization":`Bearer ${accessToken}`}
        });
        return response.data.metadata;
    }
    catch {
        return "errors.com.epicgames";
    }
}

async function GetCreatorInfo(credentialsToken, creatorCode) {
    try{
        const response = await axios.get(`https://affiliate-public-service-prod.ol.epicgames.com/affiliate/api/public/affiliates/slug/${creatorCode}`, {
            headers: {"Authorization":`Bearer ${credentialsToken}`}
        });
        return response.data;
    }
    catch {
        return "errors.com.epicgames";
    }
}

async function GetCreatorIsland(accessToken, creatorId) {
    try{
        const response = await axios.get(`https://fn-service-discovery-live-public.ogs.live.on.epicgames.com/api/v1/creator/page/${creatorId}?playerId=${accountId}&limit=100`, {
            headers: {"Authorization":`Bearer ${accessToken}`}
        });
        return response.data;
    }
    catch {
        return "errors.com.epicgames";
    }
}