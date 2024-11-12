
# Metadata 
Finally, we reached the last point. 
Up until now we focused on all those aspects that if ignore transform in a bad headache for you and your legal team. 
However now, we focus on another aspect which is more in line with standardization and best practices.
this point includes everyeon, from the phd student that releases a new dataset on hugging face, to the big company that sells processed data. 
That is metadata. 
 
The Data Act (see previous post) defines metadata as "means a structured description of the contents or the use of data facilitating the discovery or use of that data", until here we are in the clear[^metadata_dataact].

[^metadata_dataact]: We need to consider that the Data act is more about the data requirements between a business and clients (or other business) and do not really apply to the context of releaseing datasets for ai training. However, we can still learn from it. 

Unfortunately not much else is saida about metadata in the data act, so we'll need to check other documents too. 
Before that tho, we need to make an important distinguo
When talking about metadata, we shold ask ourself what is the granularity level. One thing is to have  metadata information for an entire dataset (somethign akin to hugginface [data cards](https://huggingface.co/docs/hub/en/datasets-cards)), another is to have it for each data point in the dataset. So let's start with the first one. 

## Data Cards

This one is pretty easy and we have some hints on to what the metadata should look like. Let's make a list based on what is necessary and what is best practice from an EU pov. 
- Necessary
  - Data format (Data Act - Recital 64): this is obvious, reading a csv file is different from reading a parquet one and so on. 
  - License (Data Act - Recital 64; )

