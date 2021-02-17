import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Observable, Subject } from "rxjs"
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(
        private http: HttpClient,
        private router: Router) { }


    getPosts(): void {
        this.http
            .get<{ id: string, message: string, posts: any }>('http://localhost:3000/api/posts')
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
                this.postsUpdated.next([...this.posts]);
            });
    }

    getPostUpdateListener(): Observable<Post[]> {
        return this.postsUpdated.asObservable();
    }

    getPost(postId: string) {
        return this.http.get<{ _id: string, title: string, content: string }>('http://localhost:3000/api/posts/' + postId);
    }

    addPost(aTitle: string, aContent: string): void {
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

                this.navigateToRoot();
            });

    }

    updatePost(aId: string, aTitle: string, aContent: string): void {
        const updatedPost: Post = { id: aId, title: aTitle, content: aContent };
        this.http
            .put('http://localhost:3000/api/posts/' + aId, updatedPost)
            .subscribe(response => {
                // For consistency' sake - updating the Post array won't be necessary in the PostCreate component.
                const upToDatePosts = [...this.posts];
                const oldPostIndex = upToDatePosts.findIndex(p => p.id === updatedPost.id);

                upToDatePosts[oldPostIndex] = updatedPost;

                this.posts = upToDatePosts;
                this.postsUpdated.next([...this.posts]);

                this.navigateToRoot();
            });
    }

    deletePost(postId: string): void {
        this.http
            .delete('http://localhost:3000/api/posts/' + postId)
            .subscribe(() => {
                const upToDatePosts = this.posts.filter(post => post.id !== postId);
                this.posts = upToDatePosts;
                this.postsUpdated.next([...this.posts]);
            })
    }

    private navigateToRoot(): void {
        this.router.navigate(['/']);
    }
}