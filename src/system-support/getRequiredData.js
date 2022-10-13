
export async function getRequiredData(data) {
    //let {item, itemId, itemUuid, itemName, token, tokenId, tokenUuid, targets, actorId, actor} = data;

    if (!data.token) {
        data.token = getToken(data);
    }
    if (!data.item) {
        data.item = await getItem(data)
    }
    if (!data.token && data.item) {
        // Last ditch effort to find a token
        data.token = data.item.parent?.token ?? getTokenFromItemID(data.item.id)
    }
    if (!data.targets) {
        data.targets = Array.from(game.user.targets)
    }

    return {item: data.item, token: data.token, targets: data.targets}
}

async function getItem(data) {
    let {item, itemId, itemUuid, itemName, token, tokenId, tokenUuid, targets, actorId, actor} = data;
    return itemUuid 
            ? await getItemFromUuid(itemUuid)
            : itemId && (actorId || actor)
            ? await getItemFromCompiledUuid(itemId, actor, actorId)
            : token && itemId
            ? getItemFromToken(token, itemId)
            : tokenId && itemId
            ? getItemFromTokenId(tokenId, itemId)
            : tokenUuid && itemId
            ? getItemFromTokenUuid(tokenUuid, itemId)
            : token && itemName
            ? getItemFromName(token, itemName)
            : itemId
            ? getItemFromIdBlind(itemId)
            : null
}
async function getItemFromUuid(uuid) {
    return fromUuid(uuid);
}
async function getItemFromCompiledUuid(itemId, actor, actorId) {
    const idActor = actor ? actor.id : actorId;
    return fromUuid(`Actor.${idActor}.Item.${itemId}`);
}
function getItemFromToken(token, itemId) {
    return token.actor?.items?.get(itemId)
}
function getItemFromTokenId(tokenId, itemId) {
    let token = getTokenFromScene(tokenId) || getTokenFromCompiledUuid(tokenId);
    if (!token) { return; }
    return getItemFromToken(token, itemId);
}
function getItemFromTokenUuid(tokenUuid, itemId) {
    let token = getTokenFromUuid(tokenUuid);
    if (!token) { return; }
    return getItemFromToken(token, itemId);
}
function getItemFromName(token, name) {
    let items = Array.from(token.actor.items);
    return items.find(x => x.name === name)
}
function getItemFromIdBlind(id) {
    for (let token of canvas.tokens.placeables) {
        let items = Array.from(token.actor.items);
        let foundItem = items.find(c => c.id === id);
        if (foundItem) { return foundItem}
    }
}


function getToken(data) {
    let {item, itemId, itemUuid, itemName, token, tokenId, tokenUuid, targets, actorId, actor} = data;

    return tokenId
            ? getTokenFromScene(tokenId) || getTokenFromCompiledUuid(tokenId)
            : tokenUuid
            ? getTokenFromUuid(tokenUuid)
            : item
            ? item.parent?.token ?? getTokenFromItemID(item.id)
            : itemId
            ? getTokenFromItemID(itemId)
            : actor || actorId
            ? getTokenFromActor(actor, actorId)
            : null
}
function getTokenFromItemID(id) {
    return canvas.tokens.placeables.find(token => token.actor?.items?.get(id) != null);
}
function getTokenFromScene(id) {
    return canvas.scene.tokens.get(id);
}
function getTokenFromUuid(uuid) {
    return fromUuidSync(uuid).object;
}
function getTokenFromCompiledUuid(id) {
    return fromUuidSync(`${canvas.scene.uuid}.Token.${id}`).object;
}
function getTokenFromActor(actor, actorId) {
    let idActor = actor ? actor.id : actorId;
    let foundActor = fromUuidSync(idActor);
    let token = foundActor.getActiveTokens();
    return Array.isArray(token) ? token[0] : token;
}
