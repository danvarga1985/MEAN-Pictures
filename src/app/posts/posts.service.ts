import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { Post } from "./post.model";

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
            id: post._id,
            imagePath: post.imagePath
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
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(
      'http://localhost:3000/api/posts/' + postId
    );
  }

  addPost(aTitle: string, aContent: string, aImage: File): void {
    // 'FormData' allows the combination of text-values and BLOB
    const postData = new FormData();
    postData.append('title', aTitle);
    postData.append('content', aContent);
    postData.append('image', aImage, aTitle);


    this.http
      .post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
      .subscribe((responseData) => {
        const post: Post = {
          id: responseData.post.id,
          title: aTitle,
          content: aContent,
          imagePath: responseData.post.imagePath
        };

        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);

        this.navigateToRoot();
      });

  }

  updatePost(aId: string, aTitle: string, aContent: string, aImage: File | string): void {
    let postData: Post | FormData;

    if (typeof (aImage) === 'object') {
      postData = new FormData();
      postData.append('id', aId);
      postData.append('title', aTitle);
      postData.append('content', aContent);
      postData.append('image', aImage, aTitle);
    } else {
      postData = {
        id: aId,
        title: aTitle,
        content: aContent,
        imagePath: aImage
      }
    }

    this.http
      .put('http://localhost:3000/api/posts/' + aId, postData)
      .subscribe(response => {
        // For consistency' sake - updating the Post array won't be necessary in the PostCreate component.
        const upToDatePosts = [...this.posts];
        const oldPostIndex = upToDatePosts.findIndex(p => p.id === aId);

        const post: Post = {
          id: aId,
          title: aTitle,
          content: aContent,
          //TODO: fix empty path
          imagePath: ''
        }

        upToDatePosts[oldPostIndex] = post;

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
