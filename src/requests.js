import fetch from 'node-fetch';

export const options = {
    headers: {
        Authorization: `Bearer ${process.env.TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
};

const ggApi = 'https://www.guilded.gg/api';
export const request = async (url, opts, exponentialBackOff = 1) => {

    const execute = async () => {
        try {
            const response = await fetch(ggApi + url, {...options, ...opts})
            const data = await response.json()
            if(response.status >= 300) {
                console.error({
                    status: response.status,
                    statusText: response.statusText,
                    data
                }, url, opts)
            }
            return {data, response};
        } catch(e) {
            console.error('Response Catch:', e)
        }
        return {}
    }

    const { data, response } = await execute();
    if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || exponentialBackOff * 2;
        const retryAfterMs = Number.isNaN(+retryAfter) ? Date.parse(retryAfter) - Date.now() : +retryAfter * 1000;

        return new Promise(async (resolve) => {
            setTimeout(async () => resolve(await request(url, opts)), retryAfterMs);
        });
    }
    return data;
}