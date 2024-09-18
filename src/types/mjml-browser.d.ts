declare module 'mjml-browser' {
    type MjmlOutput = {
        html: string;
        errors: {
            line: number;
            formattedMessage: string;
        }[];
    }
    const convertMjmlToHtml: (string) => MjmlOutput;
    export default convertMjmlToHtml;
}