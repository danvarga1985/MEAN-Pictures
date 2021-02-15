import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Subject } from "rxjs"
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient) { }


    getPosts() {
        this.http.get<{ id: string, message: string, posts: Post[] }>('http://localhost:3000/api/posts')
            .subscribe((postData) => {
                this.posts = postData.posts;
                this.postsUpdated.next(this.posts);
            });
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    addPost(aTitle: string, aContent: string) {
        const newPost: Post = { id: null, title: aTitle, content: aContent };

        this.http
            .post<{ message: string }>('http://localhost:3000/api/posts', newPost)
            .subscribe((responseData) => {
                console.log(responseData.message);

                this.posts.push(newPost);
                this.postsUpdated.next([...this.posts]);
            });
    }
}