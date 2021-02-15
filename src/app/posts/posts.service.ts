import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Subject } from "rxjs"
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient) { }


    getPosts() {
        this.http.get<{ id: string, message: string, posts: any }>('http://localhost:3000/api/posts')
            .pipe(map((postData) => {
                // Wrapped as an Observable
                return postData.posts.map(post => {
                    // Transform mongodb 'ObjectId' field (_id) according to the 'Post' model (id).
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id
                    };
                });
            }))
            .subscribe((transformedPosts) => {
                this.posts = transformedPosts;
                this.postsUpdated.next(this.posts);
            });
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    addPost(aTitle: string, aContent: string) {
        const newPost: Post = { id: null, title: aTitle, content: aContent };

        this.http
            .post<{ message: string, postId: string }>('http://localhost:3000/api/posts', newPost)
            .subscribe((responseData) => {
                const postId = responseData.postId;
                // Even though 'newPost' is a constant, this is valid, because the value isn't actually overwritten - 
                // Objects are reference types, so the properties can be accessed this way, while keeping the object itself.
                newPost.id = postId;

                this.posts.push(newPost);
                this.postsUpdated.next([...this.posts]);
            });
    }

    deletePost(postId: string) {
        this.http
            .delete('http://localhost:3000/api/posts/' + postId)
            .subscribe(() => {
                const updatedPosts = this.posts.filter(post => post.id != postId);
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
            })
    }
}