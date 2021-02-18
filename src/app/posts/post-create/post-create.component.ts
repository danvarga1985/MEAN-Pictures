import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { mimeType } from './mime-type.validator'

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
    private mode: string = 'create';
    private postId: string;
    post: Post;
    isLoading = false;
    form: FormGroup;
    imagePreview: string;

    constructor(
        public postService: PostService,
        public route: ActivatedRoute
    ) { }


    ngOnInit(): void {
        this.form = new FormGroup({
            'title': new FormControl(
                null,
                {
                    validators: [
                        Validators.required,
                        Validators.minLength(3)]
                }),
            'content': new FormControl(
                null,
                {
                    validators: [Validators.required]
                }),
            'image': new FormControl(
                null,
                {
                    validators: [Validators.required],
                    asyncValidators: [mimeType]
                }
            )
        });

        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                this.isLoading = true;
                this.postService.getPost(this.postId)
                    .subscribe(postData => {
                        this.isLoading = false;
                        this.post = {
                            id: postData._id,
                            title: postData.title,
                            content: postData.content
                        };

                        this.form.setValue({
                            'title': this.post.title,
                            'content': this.post.content
                        });

                    });
            } else {
                this.mode = 'create';
                this.postId = null;
            }
        });
    }

    onSavePost(): void {
        if (this.form.invalid) {
            return;
        }

        this.isLoading = true;

        if (this.mode === 'create') {
            console.log(this.form.value.title);

            this.postService.addPost(this.form.value.title, this.form.value.content);
        } else {
            this.postService.updatePost(this.postId, this.form.value.title, this.form.value.content);
        }

        this.form.reset();
    };

    onImagePicked(event: Event): void {
        const file = (event.target as HTMLInputElement).files[0];
        
        // 'patchValue' (as opposed to setValue, which targets all controls) only targets a single control of the form.
        this.form.patchValue({image: file});
        
        // Make Angular
        // a. know that the value has changed
        // b. store that value internally
        // c. check if the value is valid
        this.form.get('image').updateValueAndValidity();
    
        // convert image to DataUrl
        const reader = new FileReader();

        reader.onload = () => {
            this.imagePreview = reader.result as string;
        }
        
        reader.readAsDataURL(file);
        

    }
}