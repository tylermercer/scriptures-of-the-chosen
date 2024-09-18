export default function getBaseUrl() {
    return import.meta.env.PROD ? import.meta.env.SITE : 'http://localhost:4321/'
}