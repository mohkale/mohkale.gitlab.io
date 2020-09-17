---
title: Django
date: 2020-09-17

version: 3.1
language: Python
wiki_link: https://docs.djangoproject.com/en/3.1/
---

[Django][django] is a web framework for quickly creating scalable fault torrent web
applications using python.

[django]: https://docs.djangoproject.com/en/3.1/

## Getting Started
You're gonna need to have python 3 installed. I also recommend a package manager such
as `poetry` to maintain project dependencies. After you've got both those you can
bootstrap a new project named **foo** in the cwd.

```bash
poetry init
poetry add django
poetry run django-admin startproject foo .
```

This should've generated a directory structure like:

```text
.
├── foo
│   ├── asgi.py
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
├── poetry.lock
└── pyproject.toml
```

- `poetry.lock` and `pyproject.toml` are both used by poetry to declare this as a
  python project.
- `manage.py` is a administrative script that gives you control over your application.
- `foo` is the main package for your webapp. Settings go into `settings.py` and
  routes are configured in `urls.py`.

You can start a basic web server for your application by running:

```sh
./manage.py runserver
```

### Apps
Django adopts a pluggable system reliant on python modules called apps. You can
create a new app using `manage.py`.

```sh
./manage.py startapp bar
```

This should've created a new package in your root directory called `bar`.

```text
bar
├── admin.py
├── apps.py
├── __init__.py
├── migrations
│   └── __init__.py
├── models.py
├── tests.py
└── views.py
```

- `views.py` is where we define handlers for requests. I.E. where we decide responses
  for requests.
- `tests.py` is where we create application tests. I won't be covering it in these
  notes but feel free to look [here](https://docs.djangoproject.com/en/3.1/intro/tutorial05/)
  and [here](https://docs.djangoproject.com/en/3.1/topics/testing/).
- `models.py` is where we declare the database tables and schema for our app.
- `migrations` is where django will automatically place recipes for updating databse
  changes. You should commit this directory into VC.
- `apps.py` is where you configure this application
- `admin.py` is where you can register this apps models for use in the admin dashboard.

Once you've created a new app (or installed one from somewhere else) navigate to
`settings.py` and add the apps import path to `INSTALLED_APPS`.

```python
INSTALLED_APPS = [
  ...,
  'bar',
]
```

Now Django will make sure to use the apps settings and build it's migrations when
running from `manage.py`.

## Views
Django supports both [class][cls-views] and [function][func-views] based views. The
class views come in useful when you want to extend some existing logic or share some
handling across multiple views. I'll go more into this later.

[cls-views]: https://docs.djangoproject.com/en/3.1/topics/class-based-views/
[func-views]: https://docs.djangoproject.com/en/3.1/topics/http/views/

More often though you'll be writing django views as functions. Let's try making a
view in our `views.py` file for `bar`.

```python
from django.http import HttpResponse

def home(req):
  print(req)
  return HttpResponse('hello world')
```

This simple view prints the request we get and then returns a simple response that
says *hello world*. Now we need to connect this view to some path on our site. Go to
`urls.py` and add a path for home.

```python
from bar.views import home

urlpatterns = [
  ...,
  Path('home/', home),
]
```

Now if you start the server and goto `localhost:8000/home` it should print out *hello
world*.

### Decorators for Filtering
Django has a bunch of shortcut decorators for automatically handling requests that
don't have the right structure or format. For example:

```python
from django.views.decorators.http import require_POST

@require_POST
def my_awesome_view(req):
  return HttpResponse('you're in')
```

Now only post requests make it into the body of the view. Others are immeadiately
discarded.

### Grouping Urls
However here we've imported a view from an app and routed it manually. Your apps are
likely to have dozens of views and already have a shared understanding of how they
should be mapped. You can use the `include` function to include an entire group of
views in a subpath.

Lets add another view to `views.py`.

```python
def baz(req):
  return HttpResponse('baz bag bam boom')
```

And lets add a `urls.py` file in `bar` which sets up the routes for the `bar` app.

```python
from .views import home, baz
from django.urls import path, include

urlpatterns = [
    path('home/', home),
    path('baz/', baz),
]
```

And lets change our previous route for `home` in `foo/urls.py` to include these
urlpatterns under a new path.

```python
from django.urls import path, include

urlpatterns = [
  ...,
  path('bar/', include('bar.urls')),
]
```

Now we can goto `localhost:8000/bar/home` to see the home view or
`localhost:8000/bar/baz` to see the baz view. You can nest includes like this for as
many apps as you want.

### Namespacing Routes
You can give a view a name attribute to reference it in templates or with the
[reverse][rev] function.

[rev]: https://docs.djangoproject.com/en/3.1/ref/urlresolvers/#reverse

```python
urlpatterns = [
    path('home/', home, name='home'),
    path('baz/', baz, name='baz),
]
```

Now we can run `reverse('home')` to get the URL for the home route, we can also
supply args or parameters for the request to the URL. There's also a [resolve][res]
function to convert a URL path to a view function.

[res]: https://docs.djangoproject.com/en/3.1/ref/urlresolvers/#resolve

For some added privacy when working with common names such as `home` or `login` you
can define a variable in your apps `urls.py` file to add another namespace for the
`reverse` function to work.

```python
app_name = 'my-super-cool-app'
urlpatterns = [
  ...,
]
```

Now each route with a name in urlpatterns requires a `my-super-cool-app:` prefix when
reversing. So `reverse('home')` is now `reverse('my-super-cool-app:home')`.

### Class Views
Django supports [generic][generic-views] class based views for automating a lot of
the boilerplate in creating a view. For example you can automatically generate a
login page from the appropriate User model. Each of these generic views has a
`.as_view()` function to turn them into function views when using them in a path.

[generic-views]: https://docs.djangoproject.com/en/3.1/intro/tutorial04/#amend-views

## Templates
Django has it's own mustache like [templating][templates] engine with tags and filters. See
[here][template-lang] for a list of available tags and filters. Django also supports
letting you use other templating engines.

[tempaltes]: https://docs.djangoproject.com/en/3.1/topics/templates/#the-django-template-language
[template-lang]: https://docs.djangoproject.com/en/3.1/ref/templates/builtins/

There's a [list][t-lookup] of lookup rules for where django looks for a template. By
default it'll look in a templates directory in the root of your project and in every
subproject directory.

**NOTE**: Each templates import path is from the root of the directory in it's lookup
path. If you put a template at `bar/templates/foo.html` you import it with `foo.html`.
It's recommended to namespace templates with the app their for, so for `bar` put your
templates in `bar/templates/bar/foo.html` and import as `bar/foo.html`.

[t-lookup]: https://docs.djangoproject.com/en/3.1/topics/templates/#configuration

The general work flow for loading a template file and evaluating it is:

```python
from django.http import HttpResponse
from django.template import loader

def my_view(req):
  t = loader.get_template(bar/index.html')
  return HttpResponse(t.render({}, req))
```

First we load the template, then we evaluate the template with a context dictionary
and our request. This process is so common that there's a shortcut function to
automatically fetch the template and evaluate it into a HTTP Response.

```python
from django.shortcuts import render

def my_view(req):
  return render(req, 'bar/index.html', {})
```

## Forms
Django lets you define forms using plug and play python objects. This powerful
paradigm also gives you automatic verifiers. Lets try it out. First we create a
subclass of `django.forms.form`.

```python
from django import forms

class NameForm(forms.Form):
  name = forms.CharField(label='Your name', max_length=100)
```

Now in our views we instantiate this form:

```python
from .forms import NameForm

from django.shortcuts import render
from django.http import HttpResponseRedirect

def my_view(req):
  if req.method == 'POST':
    form = NameForm(req.POST)
    if form.is_valid()
      return HttpResponseRedirect('/thanks/')
    else:
      form = NameForm()

    return render(request, 'name.html', {'form': form})
```

And in our template we can just insert our form instance directly and django will
automatically include the fields alongside their current data and any validation
error messages etc.

```html
<form action="/my-view/" method="post">
  {% csrf_token %}
  {{ form }}
  <input type="submit" value="Submit">
</form>
```

Did you catch what we did there? It was kind of a lot all at once so let's go over it
in detail. First we create a form class. This class supports a bunch of form
[fields][f-fields] that each have their own form [widgets][f-widgets] and options.

Then in our view we check if the user is POSTing, if so we take the post data and
populate a new form instance with it. We then check whether all the data is OK, if it
is then we redirect to a success page, otherwise we return the original page with our
updated form. If the user wasn't posting to begin with we return an empty form.

[f-fields]: https://docs.djangoproject.com/en/3.1/ref/forms/fields/
[f-widgets]: https://docs.djangoproject.com/en/3.1/ref/forms/widgets/

Then finally in the templates we include the forms fields in a form tag alongisde a
CSRF token and submission button.

## Models
A models is djangos abstraction over your database and the data within it. A django
model is just a class (deriving from `django.db.models.Model`) which contains a bunch
of [fields][m-fields]. Each field has a bunch of [shared-options][m-so] and some
unique ones. The API is strikingly similair to Forms.

[m-so]: https://docs.djangoproject.com/en/3.1/ref/models/fields/#field-options
[m-fields]: https://docs.djangoproject.com/en/3.1/ref/models/fields/#field-types

```python
from django.db import models

class Musician(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    instrument = models.CharField(max_length=100)

class Album(models.Model):
    artist = models.ForeignKey(Musician, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    release_date = models.DateField()
    num_stars = models.IntegerField()
```

You can define relations between models using `ForeignKey`, [OneToOneField][m-one-to-one]
and [ManyToManyField][m-many-to-many].

[m-one-to-one]: https://docs.djangoproject.com/en/3.1/topics/db/models/#one-to-one-relationships
[m-many-to-many]: https://docs.djangoproject.com/en/3.1/topics/db/models/#many-to-many-relationships

Each model class can also define a `Meta` subclass to specify options that the model
can support. An exhaustive list of such options can be found [here][m-meta-opts]. The
most important ones are:

[m-meta-opts]: https://docs.djangoproject.com/en/3.1/ref/models/options/#available-meta-options

- `abstract`, when true a table won't be made for this model. Only non-abstract
  subclasses of this model will have generated tables. See
  [here](https://docs.djangoproject.com/en/3.1/topics/db/models/#abstract-base-classes).
- `base_manager_name` the name of the manager from which you can query instances of
  this model from the db. Defaults to `objects`.
- `ordering`, how objects of this model should be ordered by default.
- `verbose_name` and `verbose_name_plural`. Human readable name for the model, eg.
  *pizza* and *pizzas*.
- `proxy`, makes this model like an abstract model except one table is made for this
  model and that same table is used by classes that extend this model. This is useful
  when you want to define methods or accessors for a model but only in a unique
  circumstance. See [here](https://docs.djangoproject.com/en/3.1/topics/db/models/#proxy-models).

### Inheritance
By default when you inherit a non-proxy, non-abstract model, django will create an
implicit `OneToOneField` connecting each submodel to it's parent model. You can
access the fields in the parent table from the child table directly, even though
they'll exist in seperate databse tables. See more
[here](https://docs.djangoproject.com/en/3.1/topics/db/models/#multi-table-inheritance).

### Methods
Like with any other class you can define methods on a model and it'll be available in
model instances from a REPL or templates.

```python
class MyUser(models.Model):
  first_name = models.CharField(max_length=50)
  last_name = models.CharField(max_length=50)

  @property
  def full_name(self):
    return f"{self.first_name} {self.last_name}"
```

### Migrations
Every time you make a change to any of the models in your django app, you need to
migrate those changes to your database. Django will warn you if you try to run the
server while having pending migrations.

```sh
./manage.py makemigrations
./manage.py migrate
```

### Managers
Managers are how you can interface with your database from a model. They let you
create new model objects and query existing models.

For example:

```python
# You can create a new model by creating a new instance
p = Pizza(name='super meat lovers')
# You access and modify fields just like regular python.
p.name = 'EXTRA' + p.name
# django won't save changes automatically, explicitly call save()
# to persist modifications to the db.

# You can use a manager to access the database in one step.
# The create method automatically saves a new row.
Pizza.objects.create(name='vegan supreme')

# You can get all entries as a lazy QuerySet with:
Pizza.objects.all() #=> [Pizza(...), ...]

# You can refine a queryset with filter and exclude.
# django lets you use kwarg arguments seperated by double
# underscores to specify query parameters like this.
Author.objects.all().filter(birthday__year__lt=2005)
Author.objects.filter(birthday__year__lt=2005)

# QuerySets are immutable, each refinement produces a new
# query set.
q1 = Author.objects.all()
q2 = q1.filter(name__exact="RealName")
q1 == q2 #=> False

# You can extract values from a query set with an array lookup.
# if the value doesn't None will be returned.
q2[0] #=> None
# A stricter way to get the first result of a query set is with the
# get() method.
q2.get() # Error Author.DoesNotExist
# You can also call .get() on the manager directly.

# Every model has a pk field which refers to the primary key for
# the model.
Autho.objects.get(pk=1)

# Let's create a few authors
john = Author.objects.create(name="John")
paul = Author.objects.create(name="Paul")
george = Author.objects.create(name="George")
ringo = Author.objects.create(name="Ringo")
entry.authors.add(john, paul, george, ringo)
```

For a list of supported field lookups with querysets, see
[here](https://docs.djangoproject.com/en/3.1/ref/models/querysets/#field-lookups).
For lookups that can span across OneToOne or ManyToMany fields, see
[here](https://docs.djangoproject.com/en/3.1/topics/db/queries/#lookups-that-span-relationships).

### F-Expressions
[F-Expressions][f-exp] are a way to compare values of a model field with another
field in the same model.

[f-exp]: https://docs.djangoproject.com/en/3.1/topics/db/queries/#filters-can-reference-fields-on-the-model

```python
from django.db.models import F

Entry.objects.filter(number_of_comments__gt=F('number_of_pingbacks'))
```

Here we get all the objects in Entry where the number of comments they have is larger
than the number of pingback they have. Both these two fields are part of the model
itself.

### Q-Expressions
Multiple calls to `filter` or `exclude` in a QuerySet has different behaviour
depending on how the call is made. See [here][q-filter-filter]. By default
`q.filter(A,B)` filters in all rows that match `A and B` at the same time whereas
`q.filter(A).filter(B)` filters in all rows that match `A` or match `B` but not
necessarily both at the same time.

[q-filter-filter]: https://stackoverflow.com/a/8164920

[Q-Expressions][q-expr] give you a way to build more complex queries without
requiring them to be Anded together in `q.filter(A,B)`. A Q expression just holds a
query such as:

[q-expr]: https://docs.djangoproject.com/en/3.1/topics/db/queries/#complex-lookups-with-q-objects

```python
Q(question__startswith='Who')
```

You can then OR this query with another query such as:

```python
Q(question__startswith='Who') | Q(question__startswith='What')
```

Now when we pass this to our models manager:

```python
Poll.objects.get(Q(question__startswith='Who') | Q(question__startswith='What'))
```

We get a poll object that starts with `Who` or starts with `What`.
