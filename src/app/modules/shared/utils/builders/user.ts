export function buildUser(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,
        username: source?.username ?? '',
        password: source?.password ?? '',
        active: source?.active ?? false,
        email: source?.email ?? '',
        firstName: source?.firstName ?? '',
        lastName: source?.lastName ?? '',
    };
}
