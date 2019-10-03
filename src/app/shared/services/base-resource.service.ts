import { BaseResourceModel } from '../models/base-resource.model';

import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators'
import { Injector } from '@angular/core';

export abstract class BaseResourceService<T extends BaseResourceModel>{

    protected http: HttpClient    

    constructor(protected apiPath:string, protected injector: Injector){
        this.http = injector.get(HttpClient)
    }

    getAll(): Observable<T[]> {
        return this.http.get(this.apiPath).pipe(
            map(this.jsonDataToResources),
            catchError(this.handleError)
        )
    }

    getById(id: number): Observable<T> {
        const url = `${this.apiPath}/${id}`

        return this.http.get(url).pipe(
            map(this.jsonDataToResource),
            catchError(this.handleError)
        )
    }

    create(resource: T): Observable<T> {
        return this.http.post(this.apiPath, resource).pipe(
            map(this.jsonDataToResource),
            catchError(this.handleError)
        )
    }

    update(resource: T): Observable<T> {
        const url = `${this.apiPath}/${resource.id}`

        return this.http.put(url, resource).pipe(
            map(() => resource),//estou retornando ele mesmo por que o InMemory não retorna nada em um update
            catchError(this.handleError)
        )
    }

    delete(id: number): Observable<any> {
        const url = `${this.apiPath}/${id}`

        return this.http.delete(url).pipe(
            map(() => null),
            catchError(this.handleError)
        )
    }


    protected jsonDataToResources(jsonData: any): T[] {
        const resources: T[] = []
        jsonData.forEach(element => resources.push(element as T));
        return resources
    }

    protected jsonDataToResource(jsonData: any): T {
        return jsonData as T
    }

    protected handleError(error: any): Observable<any> {
        console.log('Erro na requisição =>,', error)
        return throwError(error)
    }

}