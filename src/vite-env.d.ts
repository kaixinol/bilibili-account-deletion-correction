declare module "$" {
    function GM_registerMenuCommand(name: string, listener: () => void): void;
    function GM_getValue<T>(key: string, defaultValue: T): T;
    function GM_setValue<T>(key: string, value: T): void;
}
